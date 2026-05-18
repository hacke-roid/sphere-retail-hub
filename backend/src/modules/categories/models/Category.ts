import { Schema, model } from "mongoose";

export type CategoryDocument = {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const categorySchema = new Schema<CategoryDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    parentId: { type: String, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export default model<CategoryDocument>("Category", categorySchema);
