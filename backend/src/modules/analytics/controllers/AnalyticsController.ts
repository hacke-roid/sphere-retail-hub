import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import AnalyticsService from "../services/AnalyticsService";

class AnalyticsController {
  async platformDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dashboard = await AnalyticsService.getPlatformDashboard();
      return res.status(200).json({ success: true, dashboard });
    } catch (error) {
      return next(error);
    }
  }

  async platformAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const analytics = await AnalyticsService.getPlatformAnalytics();
      return res.status(200).json({ success: true, analytics });
    } catch (error) {
      return next(error);
    }
  }

  async tenantAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const tenantId =
        req.user?.role === "super_admin"
          ? (req.query.tenantId as string)
          : req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ success: false, message: "tenantId is required" });
      }

      const analytics = await AnalyticsService.getTenantAnalytics(tenantId);
      return res.status(200).json({ success: true, analytics });
    } catch (error) {
      return next(error);
    }
  }
}

export default new AnalyticsController();
