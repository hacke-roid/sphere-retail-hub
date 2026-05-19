import type { NextFunction, Request, Response } from "express";

const passwordMinLength = 8;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const fail = (res: Response, message: string) =>
  res.status(400).json({
    success: false,
    message,
  });

export const validateRegisterRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";
  const role =
    req.body.role === "super_admin" ||
    req.body.role === "admin" ||
    req.body.role === "member"
      ? req.body.role
      : undefined;
  const tenantId =
    typeof req.body.tenantId === "string" ? req.body.tenantId.trim() : undefined;

  if (!name || !email || password.length < passwordMinLength) {
    return fail(
      res,
      "Name, email, and an 8+ character password are required",
    );
  }

  req.body.name = name;
  req.body.email = email;
  req.body.password = password;
  req.body.role = role;
  req.body.tenantId = tenantId || undefined;

  return next();
};

export const validateCreateUserRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";
  const role =
    req.body.role === "admin" || req.body.role === "member"
      ? req.body.role
      : undefined;
  const tenantId =
    typeof req.body.tenantId === "string" ? req.body.tenantId.trim() : "";

  if (!name || !email || !role) {
    return fail(res, "Name, email, and role are required");
  }

  req.body.name = name;
  req.body.email = email;
  req.body.role = role;
  req.body.tenantId = tenantId || undefined;
  delete req.body.password;

  return next();
};

export const validateUpdateUserRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : undefined;
  const email =
    typeof req.body.email === "string"
      ? normalizeEmail(req.body.email)
      : undefined;
  const role =
    req.body.role === "super_admin" ||
    req.body.role === "admin" ||
    req.body.role === "member"
      ? req.body.role
      : undefined;
  const tenantId =
    typeof req.body.tenantId === "string" ? req.body.tenantId.trim() : undefined;
  const status =
    req.body.status === "active" ||
    req.body.status === "inactive" ||
    req.body.status === "suspended"
      ? req.body.status
      : undefined;

  if (!name && !email && !role && tenantId === undefined && !status) {
    return fail(res, "At least one user field is required");
  }

  req.body = {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(role ? { role } : {}),
    ...(tenantId !== undefined ? { tenantId: tenantId || undefined } : {}),
    ...(status ? { status } : {}),
  };

  return next();
};

export const validateLoginRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email =
    typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return fail(res, "Email and password are required");
  }

  req.body.email = email;
  req.body.password = password;

  return next();
};

export const validateForgotPasswordRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email =
    typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";

  if (!email) {
    return fail(res, "Email is required");
  }

  req.body.email = email;

  return next();
};

export const validateResetPasswordRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = typeof req.body.token === "string" ? req.body.token : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!token || password.length < passwordMinLength) {
    return fail(res, "Reset token and an 8+ character password are required");
  }

  req.body.token = token;
  req.body.password = password;

  return next();
};
