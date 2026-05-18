import { Schema, model } from "mongoose";

export type ProductDocument = {
  _id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  stockQuantity: number;
  showStock: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new Schema<ProductDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    categoryId: { type: String, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    showStock: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true },
);

export default model<ProductDocument>("Product", productSchema);
