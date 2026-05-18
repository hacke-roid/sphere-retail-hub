import type { UserRecord } from "../repositories/UserRepository";

export type PublicUser = Pick<UserRecord, "id" | "name" | "email"> & {
  createdAt: string;
};

export type AuthResponse = {
  user: PublicUser;
  token: string;
};

export type ForgotPasswordResponse = {
  resetToken?: string;
};
