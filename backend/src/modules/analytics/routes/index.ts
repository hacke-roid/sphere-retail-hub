/**
 * Analytics routes for Super Admin dashboard and tenant admin insights.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
  authorizeRole,
} from "../../../middleware/auth";
import AnalyticsController from "../controllers/AnalyticsController";

const router = express.Router();

router.use(authenticate);

router.get(
  "/dashboard",
  authorizeRole("super_admin"),
  authorizePermission("platform:view"),
  AnalyticsController.platformDashboard,
);
router.get(
  "/platform",
  authorizeRole("super_admin"),
  authorizePermission("analytics:view"),
  AnalyticsController.platformAnalytics,
);
router.get(
  "/tenant",
  authorizeRole("admin", "super_admin"),
  authorizePermission("analytics:view"),
  AnalyticsController.tenantAnalytics,
);

export default router;
