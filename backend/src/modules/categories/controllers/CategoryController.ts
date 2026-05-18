import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import CategoryService from "../services/CategoryService";

const resolveTenantId = (req: AuthenticatedRequest) =>
  req.user?.role === "super_admin"
    ? (req.query.tenantId as string) || req.body.tenantId
    : req.user?.tenantId;

class CategoryController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const categories = await CategoryService.list(tenantId);
      return res.status(200).json({ success: true, categories });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const category = await CategoryService.create(tenantId, req.body);
      return res.status(201).json({ success: true, category });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const category = await CategoryService.getById(tenantId, String(req.params.id));
      if (!category) return res.status(404).json({ success: false, message: "Category not found" });

      return res.status(200).json({ success: true, category });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const category = await CategoryService.update(tenantId, String(req.params.id), req.body);
      if (!category) return res.status(404).json({ success: false, message: "Category not found" });

      return res.status(200).json({ success: true, category });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      await CategoryService.delete(tenantId, String(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new CategoryController();
