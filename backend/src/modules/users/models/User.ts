import { Schema, model } from "mongoose";

export type UserDocument = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "member";
  tenantId?: string;
  status: "active" | "inactive" | "suspended";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "member"],
      default: "member",
      index: true,
    },
    tenantId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default model<UserDocument>("User", userSchema);
