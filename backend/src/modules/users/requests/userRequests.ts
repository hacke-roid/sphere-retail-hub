export type RegisterUserRequest = {
  name: string;
  email: string;
  password: string;
  role?: "super_admin" | "admin" | "member";
  tenantId?: string;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};
