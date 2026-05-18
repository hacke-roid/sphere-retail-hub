import bcrypt from "bcryptjs";
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
    });

    return {
      user: toPublicUser(user),
      token: signUserToken(user),
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

  updateStatus(id: string, status: "active" | "inactive" | "suspended") {
    return UserRepository.updateStatus(id, status);
  }

  deleteUser(id: string) {
    return UserRepository.delete(id);
  }
}

export default new UserService();
