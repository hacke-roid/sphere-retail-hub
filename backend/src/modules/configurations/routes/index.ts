/**
 * Shop configuration routes; tenant admins manage storefront settings.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/auth";
import ConfigurationController from "../controllers/ConfigurationController";

const router = express.Router();

router.use(authenticate);

router.get("/page", authorizePermission("shop:view"), ConfigurationController.pageData);
router.get("/", authorizePermission("shop:view"), ConfigurationController.get);
router.put("/", authorizePermission("shop:edit"), ConfigurationController.save);

export default router;
