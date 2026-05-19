import { Schema, model } from "mongoose";

export type ShopConfigurationDocument = {
  _id: string;
  tenantId: string;
  shopName: string;
  logoUrl?: string;
  bannerUrls: string[];
  homepage: {
    sections: {
      bannerCarousel: boolean;
      categoryShowcase: boolean;
      featuredProducts: boolean;
      latestProducts: boolean;
      bestSellers: boolean;
    };
    productsPerRow: number;
    itemsPerPage: number;
    banners: Array<{
      id: string;
      title: string;
      subtitle?: string;
      imageUrl?: string;
      buttonLabel?: string;
      categoryId?: string;
      tone?: string;
    }>;
    categoryShowcase: Array<{
      id: string;
      categoryId: string;
      title?: string;
      imageUrl?: string;
    }>;
  };
  features: {
    productSearch: boolean;
    wishlist: boolean;
    productReviews: boolean;
    filters: boolean;
    sorting: boolean;
    addToCart: boolean;
    orderHistory: boolean;
    productRecommendations: boolean;
  };
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    layout?: string;
    wideLayout?: boolean;
    cardShadows?: boolean;
    roundedCorners?: boolean;
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
    homepage: {
      sections: {
        bannerCarousel: { type: Boolean, default: true },
        categoryShowcase: { type: Boolean, default: true },
        featuredProducts: { type: Boolean, default: true },
        latestProducts: { type: Boolean, default: false },
        bestSellers: { type: Boolean, default: false },
      },
      productsPerRow: { type: Number, default: 3 },
      itemsPerPage: { type: Number, default: 12 },
      banners: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          subtitle: { type: String },
          imageUrl: { type: String },
          buttonLabel: { type: String },
          categoryId: { type: String },
          tone: { type: String },
        },
      ],
      categoryShowcase: [
        {
          id: { type: String, required: true },
          categoryId: { type: String, required: true },
          title: { type: String },
          imageUrl: { type: String },
        },
      ],
    },
    features: {
      productSearch: { type: Boolean, default: true },
      wishlist: { type: Boolean, default: true },
      productReviews: { type: Boolean, default: true },
      filters: { type: Boolean, default: true },
      sorting: { type: Boolean, default: true },
      addToCart: { type: Boolean, default: false },
      orderHistory: { type: Boolean, default: false },
      productRecommendations: { type: Boolean, default: false },
    },
    theme: {
      primaryColor: { type: String },
      secondaryColor: { type: String },
      accentColor: { type: String },
      fontFamily: { type: String },
      layout: { type: String },
      wideLayout: { type: Boolean, default: true },
      cardShadows: { type: Boolean, default: true },
      roundedCorners: { type: Boolean, default: true },
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
