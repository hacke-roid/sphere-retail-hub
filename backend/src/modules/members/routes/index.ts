/**
 * Member storefront routes; only authenticated member users can access them.
 */
import express from "express";
import { authenticate, authorizeRole } from "../../../middleware/auth";
import MemberController from "../controllers/MemberController";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole("member"));

router.get("/dashboard", MemberController.dashboard);
router.get("/orders", MemberController.orders);
router.get("/wishlist", MemberController.wishlist);
router.post("/wishlist", MemberController.addWishlistItem);
router.delete("/wishlist/:productId", MemberController.removeWishlistItem);

export default router;
