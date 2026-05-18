/**
 * Product routes; Admins manage catalog, Members browse available products.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/auth";
import ProductController from "../controllers/ProductController";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizePermission("product:view"), ProductController.list);
router.post("/", authorizePermission("product:create"), ProductController.create);
router.get("/:id", authorizePermission("product:view"), ProductController.getById);
router.put("/:id", authorizePermission("product:edit"), ProductController.update);
router.delete("/:id", authorizePermission("product:delete"), ProductController.delete);

export default router;
