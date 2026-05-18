/**
 * Tenant management routes; Super Admin only.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/auth";
import TenantController from "../controllers/TenantController";
import { validateTenantCreateRequest } from "../validators/tenantRequestValidation";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizePermission("tenant:view"), TenantController.list);
router.post(
  "/",
  authorizePermission("tenant:create"),
  validateTenantCreateRequest,
  TenantController.create,
);
router.get("/:id", authorizePermission("tenant:view"), TenantController.getById);
router.put("/:id", authorizePermission("tenant:edit"), TenantController.update);
router.patch(
  "/:id/status",
  authorizePermission("tenant:edit"),
  TenantController.updateStatus,
);
router.delete("/:id", authorizePermission("tenant:delete"), TenantController.delete);

export default router;
