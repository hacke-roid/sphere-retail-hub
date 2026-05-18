import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import ConfigurationService from "../services/ConfigurationService";

const resolveTenantId = (req: AuthenticatedRequest) =>
  req.user?.role === "super_admin"
    ? (req.query.tenantId as string) || req.body.tenantId
    : req.user?.tenantId;

class ConfigurationController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const configuration = await ConfigurationService.get(tenantId);
      return res.status(200).json({ success: true, configuration });
    } catch (error) {
      return next(error);
    }
  }

  async save(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = resolveTenantId(req);
      if (!tenantId) return res.status(400).json({ success: false, message: "tenantId is required" });

      const configuration = await ConfigurationService.save(tenantId, req.body);
      return res.status(200).json({ success: true, configuration });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ConfigurationController();
