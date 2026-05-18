import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: "super_admin" | "admin" | "member";
    tenantId?: string;
    permissions: string[];
  };
};

type JwtPayload = {
  sub: string;
  email: string;
  role?: "super_admin" | "admin" | "member";
  tenantId?: string;
  permissions?: string[];
};

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret()) as JwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || "member",
      tenantId: payload.tenantId,
      permissions: payload.permissions || [],
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

export const authorizePermission =
  (permission: string) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    return next();
  };

export const authorizeAnyPermission =
  (...permissions: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    if (!permissions.some((permission) => req.user?.permissions.includes(permission))) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    return next();
  };

export const authorizeRole =
  (...roles: Array<"super_admin" | "admin" | "member">) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Your role cannot access this resource",
      });
    }

    return next();
  };

export const requireAuth = authenticate;
