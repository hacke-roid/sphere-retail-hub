export type UserRole = "super_admin" | "admin" | "member";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  status?: string;
  createdAt?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  user: AuthUser;
  token: string;
};

export type MeResponse = {
  success: boolean;
  user: AuthUser;
};
