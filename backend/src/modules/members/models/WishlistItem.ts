import { Schema, model } from "mongoose";

export type WishlistItemDocument = {
  _id: string;
  userId: string;
  tenantId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
};

const wishlistItemSchema = new Schema<WishlistItemDocument>(
  {
    userId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default model<WishlistItemDocument>("WishlistItem", wishlistItemSchema);
