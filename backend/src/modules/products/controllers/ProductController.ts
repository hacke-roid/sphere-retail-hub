import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import ProductService from "../services/ProductService";

const resolveTenantId = (req: AuthenticatedRequest) =>
  req.user?.role === "super_admin"
    ? (req.query.tenantId as string) || req.body.tenantId
    : req.user?.tenantId || (req.query.tenantId as string);

class ProductController {
  async pageData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const page = await ProductService.pageData(tenantId, req.query as Record<string, string>);
      return res.status(200).json({ success: true, page });
    } catch (error) {
      return next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const products = await ProductService.list(tenantId, req.query as Record<string, string>);
      return res.status(200).json({ success: true, products });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const product = await ProductService.create(tenantId, req.body);
      return res.status(201).json({ success: true, product });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const product = await ProductService.getById(tenantId, String(req.params.id));
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      return res.status(200).json({ success: true, product });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const product = await ProductService.update(tenantId, String(req.params.id), req.body);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      return res.status(200).json({ success: true, product });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      await ProductService.delete(tenantId, String(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProductController();
