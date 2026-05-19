import UserModel, { UserDocument } from "../models/User";
import UserAlreadyExistsError from "../errors/UserAlreadyExistsError";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "member";
  tenantId?: string;
  status: "active" | "inactive" | "suspended";
  lastLoginAt?: string;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role?: "super_admin" | "admin" | "member";
  tenantId?: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: "super_admin" | "admin" | "member";
  tenantId?: string;
  status?: "active" | "inactive" | "suspended";
};

const toUserRecord = (user: UserDocument): UserRecord => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role,
  tenantId: user.tenantId,
  status: user.status,
  lastLoginAt: user.lastLoginAt?.toISOString(),
  createdAt: user.createdAt.toISOString(),
});

class UserRepository {
  async create(input: CreateUserInput) {
    try {
      const user = await UserModel.create(input);

      return toUserRecord(user);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new UserAlreadyExistsError(input.email);
      }

      throw error;
    }
  }

  async findByEmail(email: string) {
    const user = await UserModel.findOne({ email }).exec();

    return user ? toUserRecord(user) : undefined;
  }

  async findById(id: string) {
    const user = await UserModel.findById(id).exec();

    return user ? toUserRecord(user) : undefined;
  }

  async updatePassword(id: string, passwordHash: string) {
    await UserModel.findByIdAndUpdate(id, { passwordHash }).exec();
  }

  async update(id: string, input: UpdateUserInput) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        input,
        { new: true },
      ).exec();

      return user ? toUserRecord(user) : undefined;
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new UserAlreadyExistsError(input.email || "this email");
      }

      throw error;
    }
  }

  async list(filter: { tenantId?: string; role?: string; search?: string }) {
    const query: Record<string, unknown> = {};

    if (filter.tenantId) {
      query.tenantId = filter.tenantId;
    }

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { email: { $regex: filter.search, $options: "i" } },
      ];
    }

    const users = await UserModel.find(query).sort({ createdAt: -1 }).exec();

    return users.map(toUserRecord);
  }

  async updateStatus(id: string, status: "active" | "inactive" | "suspended") {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).exec();

    return user ? toUserRecord(user) : undefined;
  }

  async recordLogin(id: string) {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async delete(id: string) {
    await UserModel.findByIdAndDelete(id).exec();
  }
}

export default new UserRepository();
