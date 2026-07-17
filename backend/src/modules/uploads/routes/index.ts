/**
 * Upload routes; tenant admins upload images to the configured CDN.
 */
import express from "express";
import multer from "multer";
import { authenticate, authorizeAnyPermission } from "../../../middleware/auth";
import UploadController from "../controllers/UploadController";

const router = express.Router();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.post(
  "/image",
  authorizeAnyPermission("product:create", "category:create", "shop:edit"),
  upload.single("image"),
  UploadController.image,
);

export default router;
