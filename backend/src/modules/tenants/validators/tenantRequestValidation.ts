import type { NextFunction, Request, Response } from "express";

export const validateTenantCreateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, type, ownerName, ownerEmail } = req.body;

  if (!name || !type || !ownerName || !ownerEmail) {
    return res.status(400).json({
      success: false,
      message: "name, type, ownerName, and ownerEmail are required",
    });
  }

  return next();
};
