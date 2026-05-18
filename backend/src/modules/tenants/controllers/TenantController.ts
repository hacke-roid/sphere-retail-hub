import type { NextFunction, Request, Response } from "express";
import TenantService from "../services/TenantService";

class TenantController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await TenantService.list(req.query as Record<string, string>);

      return res.status(200).json({ success: true, tenants });
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.create(req.body);

      return res.status(201).json({ success: true, tenant });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.getById(String(req.params.id));

      if (!tenant) {
        return res.status(404).json({ success: false, message: "Tenant not found" });
      }

      return res.status(200).json({ success: true, tenant });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.update(String(req.params.id), req.body);

      if (!tenant) {
        return res.status(404).json({ success: false, message: "Tenant not found" });
      }

      return res.status(200).json({ success: true, tenant });
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.updateStatus(String(req.params.id), req.body.status);

      if (!tenant) {
        return res.status(404).json({ success: false, message: "Tenant not found" });
      }

      return res.status(200).json({ success: true, tenant });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TenantService.delete(String(req.params.id));

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new TenantController();
