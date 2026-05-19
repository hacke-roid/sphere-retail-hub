import { Schema, model } from "mongoose";

export type MemberOrderDocument = {
  _id: string;
  userId: string;
  tenantId: string;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: "processing" | "delivered" | "cancelled";
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

const memberOrderSchema = new Schema<MemberOrderDocument>(
  {
    userId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["processing", "delivered", "cancelled"],
      default: "processing",
      index: true,
    },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default model<MemberOrderDocument>("MemberOrder", memberOrderSchema);
