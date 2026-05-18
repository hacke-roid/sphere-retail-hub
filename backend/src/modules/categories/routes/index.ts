/**
 * Category routes; tenant admins manage their own category tree.
 */
import express from "express";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/auth";
import CategoryController from "../controllers/CategoryController";

const router = express.Router();

router.use(authenticate);

router.get("/page", authorizePermission("category:view"), CategoryController.pageData);
router.get("/", authorizePermission("category:view"), CategoryController.list);
router.post("/", authorizePermission("category:create"), CategoryController.create);
router.get("/:id", authorizePermission("category:view"), CategoryController.getById);
router.put("/:id", authorizePermission("category:edit"), CategoryController.update);
router.delete("/:id", authorizePermission("category:delete"), CategoryController.delete);

export default router;
