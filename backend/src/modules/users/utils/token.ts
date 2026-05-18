import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRecord } from "../repositories/UserRepository";

export const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createResetToken = () => crypto.randomBytes(32).toString("hex");

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

export const signUserToken = (user: UserRecord) => {
  const signOptions: SignOptions = {
    subject: user.id,
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "1h") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: getPermissionsForRole(user.role),
    },
    jwtSecret(),
    signOptions,
  );
};

const getPermissionsForRole = (role: UserRecord["role"]) => {
  if (role === "super_admin") {
    return [
      "platform:view",
      "tenant:view",
      "tenant:create",
      "tenant:edit",
      "tenant:delete",
      "shop:view",
      "shop:edit",
      "product:view",
      "product:create",
      "product:edit",
      "product:delete",
      "category:view",
      "category:create",
      "category:edit",
      "category:delete",
      "user:view",
      "user:create",
      "user:edit",
      "user:delete",
      "member:view",
      "member:create",
      "member:edit",
      "profile:view",
      "profile:edit",
      "analytics:view",
      "settings:manage",
    ];
  }

  if (role === "admin") {
    return [
      "shop:view",
      "shop:edit",
      "product:view",
      "product:create",
      "product:edit",
      "product:delete",
      "category:view",
      "category:create",
      "category:edit",
      "category:delete",
      "member:view",
      "member:create",
      "member:edit",
      "profile:view",
      "profile:edit",
      "analytics:view",
    ];
  }

  return [
    "product:view",
    "category:view",
    "profile:view",
    "profile:edit",
    "wishlist:manage",
  ];
};
