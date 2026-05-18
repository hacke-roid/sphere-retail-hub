import { Schema, model } from "mongoose";

export type PlatformSettingDocument = {
  _id: string;
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
};

const platformSettingSchema = new Schema<PlatformSettingDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export default model<PlatformSettingDocument>(
  "PlatformSetting",
  platformSettingSchema,
);
