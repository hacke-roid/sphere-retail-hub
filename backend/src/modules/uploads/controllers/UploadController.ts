import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import UploadService from "../services/UploadService";

class UploadController {
  async image(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const upload = await UploadService.uploadImage(req.file);

      return res.status(201).json({
        success: true,
        upload,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new UploadController();
