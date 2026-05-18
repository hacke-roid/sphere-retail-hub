import { Schema, model } from "mongoose";

export type TenantDocument = {
  _id: string;
  name: string;
  type: "medical" | "clothing" | "grocery" | "electronics" | "other";
  ownerName: string;
  ownerEmail: string;
  subscriptionPlan: "trial" | "starter" | "pro" | "premium";
  status: "trial" | "active" | "suspended" | "inactive";
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
};

const tenantSchema = new Schema<TenantDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["medical", "clothing", "grocery", "electronics", "other"],
      required: true,
      index: true,
    },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["trial", "starter", "pro", "premium"],
      default: "trial",
      index: true,
    },
    status: {
      type: String,
      enum: ["trial", "active", "suspended", "inactive"],
      default: "trial",
      index: true,
    },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default model<TenantDocument>("Tenant", tenantSchema);
