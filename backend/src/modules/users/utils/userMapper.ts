import type { UserRecord } from "../repositories/UserRepository";

export const toPublicUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});
