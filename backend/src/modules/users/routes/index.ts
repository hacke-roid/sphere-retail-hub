/**
 * User routes; protected handlers require authenticate + permission checks.
 */
import express from "express";
import {
  authenticate,
  authorizeAnyPermission,
  authorizePermission,
} from "../../../middleware/auth";
import UserController from "../controllers/UserController";
import {
  validateCreateUserRequest,
  validateForgotPasswordRequest,
  validateLoginRequest,
  validateRegisterRequest,
  validateResetPasswordRequest,
} from "../validators/userRequestValidation";

const router = express.Router();

router.post("/register", validateRegisterRequest, UserController.register);

router.post("/login", validateLoginRequest, UserController.login);

router.post(
  "/forgot-password",
  validateForgotPasswordRequest,
  UserController.forgotPassword,
);

router.post(
  "/reset-password",
  validateResetPasswordRequest,
  UserController.resetPassword,
);

router.use(authenticate);

router.get(
  "/page",
  authorizeAnyPermission("user:view", "member:view"),
  UserController.pageData,
);

router.get(
  "/",
  authorizeAnyPermission("user:view", "member:view"),
  UserController.list,
);

router.get(
  "/me",
  authorizeAnyPermission("user:view", "profile:view"),
  UserController.getMe,
);

router.post(
  "/",
  authorizeAnyPermission("user:create", "member:create"),
  validateCreateUserRequest,
  UserController.register,
);

router.patch(
  "/:id/status",
  authorizeAnyPermission("user:edit", "member:edit"),
  UserController.updateStatus,
);

router.delete(
  "/:id",
  authorizePermission("user:delete"),
  UserController.deleteUser,
);

export default router;
