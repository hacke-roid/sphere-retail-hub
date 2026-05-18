import bcrypt from "bcryptjs";
import crypto from "crypto";
import MailService from "../../../services/MailService";
import UserAlreadyExistsError from "../errors/UserAlreadyExistsError";
import PasswordResetTokenRepository from "../repositories/PasswordResetTokenRepository";
import UserRepository from "../repositories/UserRepository";
import type {
  ForgotPasswordRequest,
  LoginUserRequest,
  RegisterUserRequest,
  ResetPasswordRequest,
} from "../requests/userRequests";
import { toPublicUser } from "../utils/userMapper";
import { createResetToken, hashResetToken, signUserToken } from "../utils/token";

class UserService {
  private createTemporaryPassword() {
    return `Sphere-${crypto.randomBytes(4).toString("hex")}`;
  }

  async register(input: RegisterUserRequest) {
    const existingUser = await UserRepository.findByEmail(input.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      tenantId: input.tenantId,
    });

    return {
      user: toPublicUser(user),
      token: signUserToken(user),
    };
  }

  async createManagedUser(input: Omit<RegisterUserRequest, "password">) {
    const existingUser = await UserRepository.findByEmail(input.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const temporaryPassword = this.createTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      tenantId: input.tenantId,
    });

    try {
      await MailService.sendWelcomePassword({
        email: user.email,
        name: user.name,
        password: temporaryPassword,
      });
    } catch (error) {
      await UserRepository.delete(user.id);
      throw error;
    }

    return {
      user: toPublicUser(user),
    };
  }

  async login(input: LoginUserRequest) {
    const user = await UserRepository.findByEmail(input.email);
    const isValidPassword =
      user && (await bcrypt.compare(input.password, user.passwordHash));

    if (!user || !isValidPassword) {
      return undefined;
    }

    await UserRepository.recordLogin(user.id);

    return {
      user: toPublicUser(user),
      token: signUserToken(user),
    };
  }

  async getMe(userId: string) {
    const user = await UserRepository.findById(userId);

    return user ? toPublicUser(user) : undefined;
  }

  async forgotPassword(input: ForgotPasswordRequest) {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
      return {};
    }

    const resetToken = createResetToken();
    await PasswordResetTokenRepository.create(user.id, hashResetToken(resetToken));

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return {
      resetToken:
        process.env.NODE_ENV === "production" ? undefined : resetToken,
    };
  }

  async resetPassword(input: ResetPasswordRequest) {
    const resetToken = await PasswordResetTokenRepository.findValidByHash(
      hashResetToken(input.token),
    );

    if (!resetToken) {
      return false;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await PasswordResetTokenRepository.resetPassword(
      resetToken.id,
      resetToken.userId,
      passwordHash,
    );

    return true;
  }

  listUsers(requester: { role: string; tenantId?: string }, query: Record<string, string | undefined>) {
    return UserRepository.list({
      tenantId: requester.role === "super_admin" ? query.tenantId : requester.tenantId,
      role: query.role,
      search: query.search,
    });
  }

  async pageData(
    requester: { role: string; tenantId?: string },
    query: Record<string, string | undefined>,
  ) {
    const users = await this.listUsers(requester, query);

    return {
      metrics: {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.status === "active").length,
        suspendedUsers: users.filter((user) => user.status === "suspended").length,
        inactiveUsers: users.filter((user) => user.status === "inactive").length,
      },
      users,
    };
  }

  updateStatus(id: string, status: "active" | "inactive" | "suspended") {
    return UserRepository.updateStatus(id, status);
  }

  deleteUser(id: string) {
    return UserRepository.delete(id);
  }
}

export default new UserService();
