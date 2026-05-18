/**
 * Platform settings routes; Super Admin only.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/auth";
import SettingsController from "../controllers/SettingsController";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizePermission("settings:manage"), SettingsController.list);
router.put("/:key", authorizePermission("settings:manage"), SettingsController.upsert);

export default router;
