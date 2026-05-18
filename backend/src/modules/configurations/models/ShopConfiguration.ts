import { Schema, model } from "mongoose";

export type ShopConfigurationDocument = {
  _id: string;
  tenantId: string;
  shopName: string;
  logoUrl?: string;
  bannerUrls: string[];
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    layout?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks: Record<string, string>;
  businessHours: Record<string, string>;
  homepageSections: string[];
  createdAt: Date;
  updatedAt: Date;
};

const shopConfigurationSchema = new Schema<ShopConfigurationDocument>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    shopName: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    bannerUrls: [{ type: String }],
    theme: {
      primaryColor: { type: String },
      secondaryColor: { type: String },
      fontFamily: { type: String },
      layout: { type: String },
    },
    contact: {
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    socialLinks: { type: Map, of: String, default: {} },
    businessHours: { type: Map, of: String, default: {} },
    homepageSections: [{ type: String }],
  },
  { timestamps: true },
);

export default model<ShopConfigurationDocument>(
  "ShopConfiguration",
  shopConfigurationSchema,
);
