import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import MemberService from "../services/MemberService";

const requesterFrom = (req: AuthenticatedRequest) => ({
  id: req.user!.id,
  tenantId: req.user!.tenantId,
});

class MemberController {
  async dashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await MemberService.dashboard(requesterFrom(req));

      return res.status(200).json({ success: true, dashboard });
    } catch (error) {
      return next(error);
    }
  }

  async orders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orders = await MemberService.orders(requesterFrom(req));

      return res.status(200).json({ success: true, orders });
    } catch (error) {
      return next(error);
    }
  }

  async wishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wishlist = await MemberService.wishlist(requesterFrom(req));

      return res.status(200).json({ success: true, wishlist });
    } catch (error) {
      return next(error);
    }
  }

  async addWishlistItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId =
        typeof req.body.productId === "string" ? req.body.productId.trim() : "";

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "productId is required",
        });
      }

      const wishlist = await MemberService.addWishlistItem(requesterFrom(req), productId);

      return res.status(201).json({ success: true, wishlist });
    } catch (error) {
      return next(error);
    }
  }

  async removeWishlistItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wishlist = await MemberService.removeWishlistItem(
        requesterFrom(req),
        String(req.params.productId),
      );

      return res.status(200).json({ success: true, wishlist });
    } catch (error) {
      return next(error);
    }
  }
}

export default new MemberController();
