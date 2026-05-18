import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import UserAlreadyExistsError from "../errors/UserAlreadyExistsError";
import UserService from "../services/UserService";

class UserController {
  async pageData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication is required" });
      }

      const page = await UserService.pageData(
        { role: req.user.role, tenantId: req.user.tenantId },
        req.query as Record<string, string>,
      );

      return res.status(200).json({ success: true, page });
    } catch (error) {
      return next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication is required" });
      }

      const users = await UserService.listUsers(
        { role: req.user.role, tenantId: req.user.tenantId },
        req.query as Record<string, string>,
      );

      return res.status(200).json({ success: true, users });
    } catch (error) {
      return next(error);
    }
  }

  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = { ...req.body };

      if (!req.user) {
        input.role = "member";
        delete input.tenantId;
      } else if (req.user.role === "admin") {
        input.role = "member";
        input.tenantId = req.user.tenantId;
      }

      const result = req.user
        ? await UserService.createManagedUser(input)
        : await UserService.register(input);

      return res.status(201).json({
        success: true,
        message: req.user
          ? "User created and password email has been sent"
          : undefined,
        ...result,
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.login(req.body);

      if (!result) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication is required",
        });
      }

      const user = await UserService.getMe(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.forgotPassword(req.body);

      return res.status(200).json({
        success: true,
        message: "If that email exists, a password reset token has been created",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const wasReset = await UserService.resetPassword(req.body);

      if (!wasReset) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Password has been reset",
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateStatus(String(req.params.id), req.body.status);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(String(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();
