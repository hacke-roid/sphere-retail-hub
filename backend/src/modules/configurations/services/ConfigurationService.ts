import ConfigurationRepository from "../repositories/ConfigurationRepository";
import CategoryService from "../../categories/services/CategoryService";

const booleanValue = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const numberValue = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : undefined;

const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const listValue = (value: unknown) => (Array.isArray(value) ? value : []);

const sanitizeConfiguration = (tenantId: string, input: Record<string, unknown>) => {
  const theme = objectValue(input.theme);
  const contact = objectValue(input.contact);
  const homepage = objectValue(input.homepage);
  const sections = objectValue(homepage.sections);
  const features = objectValue(input.features);

  return {
    tenantId,
    shopName: stringValue(input.shopName) || "Medical Store Pro",
    logoUrl: stringValue(input.logoUrl),
    bannerUrls: listValue(input.bannerUrls).map(stringValue).filter(Boolean),
    theme: {
      primaryColor: stringValue(theme.primaryColor) || "#4F46E5",
      secondaryColor: stringValue(theme.secondaryColor) || "#7C3AED",
      accentColor: stringValue(theme.accentColor) || "#06B6D4",
      fontFamily: stringValue(theme.fontFamily) || "Inter",
      layout: stringValue(theme.layout) || "modern",
      wideLayout: booleanValue(theme.wideLayout, true),
      cardShadows: booleanValue(theme.cardShadows, true),
      roundedCorners: booleanValue(theme.roundedCorners, true),
    },
    contact: {
      email: stringValue(contact.email),
      phone: stringValue(contact.phone),
      address: stringValue(contact.address),
    },
    socialLinks: objectValue(input.socialLinks),
    businessHours: objectValue(input.businessHours),
    homepageSections: listValue(input.homepageSections).map(stringValue).filter(Boolean),
    homepage: {
      sections: {
        bannerCarousel: booleanValue(sections.bannerCarousel, true),
        categoryShowcase: booleanValue(sections.categoryShowcase, true),
        featuredProducts: booleanValue(sections.featuredProducts, true),
        latestProducts: booleanValue(sections.latestProducts, false),
        bestSellers: booleanValue(sections.bestSellers, false),
      },
      productsPerRow: numberValue(homepage.productsPerRow, 3),
      itemsPerPage: numberValue(homepage.itemsPerPage, 12),
      banners: listValue(homepage.banners)
        .map((banner, index) => {
          const item = objectValue(banner);

          return {
            id: stringValue(item.id) || `banner-${index + 1}`,
            title: stringValue(item.title) || "Shop Promotion",
            subtitle: stringValue(item.subtitle),
            imageUrl: stringValue(item.imageUrl),
            buttonLabel: stringValue(item.buttonLabel) || "Shop Now",
            categoryId: stringValue(item.categoryId),
            tone: stringValue(item.tone) || (index % 2 ? "pink" : "blue"),
          };
        })
        .slice(0, 8),
      categoryShowcase: listValue(homepage.categoryShowcase)
        .map((showcase, index) => {
          const item = objectValue(showcase);
          const categoryId = stringValue(item.categoryId);

          if (!categoryId) return undefined;

          return {
            id: stringValue(item.id) || `category-${index + 1}`,
            categoryId,
            title: stringValue(item.title),
            imageUrl: stringValue(item.imageUrl),
          };
        })
        .filter(Boolean),
    },
    features: {
      productSearch: booleanValue(features.productSearch, true),
      wishlist: booleanValue(features.wishlist, true),
      productReviews: booleanValue(features.productReviews, true),
      filters: booleanValue(features.filters, true),
      sorting: booleanValue(features.sorting, true),
      addToCart: booleanValue(features.addToCart, false),
      orderHistory: booleanValue(features.orderHistory, false),
      productRecommendations: booleanValue(features.productRecommendations, false),
    },
  };
};

class ConfigurationService {
  get(tenantId: string) {
    return ConfigurationRepository.getByTenantId(tenantId);
  }

  save(tenantId: string, input: Record<string, unknown>) {
    return ConfigurationRepository.upsert(tenantId, sanitizeConfiguration(tenantId, input));
  }

  async pageData(tenantId: string) {
    const [configuration, categories] = await Promise.all([
      this.get(tenantId),
      CategoryService.list(tenantId),
    ]);
    const configuredSections = configuration
      ? [
          configuration.shopName,
          configuration.logoUrl,
          configuration.homepage?.banners?.length || configuration.bannerUrls?.length,
          configuration.homepage?.categoryShowcase?.length,
          configuration.theme,
          configuration.contact,
          configuration.homepage,
          configuration.features,
        ].filter(Boolean).length
      : 0;

    return {
      metrics: {
        configuredSections,
        bannerImages:
          configuration?.homepage?.banners?.filter((banner) => banner.imageUrl).length ||
          configuration?.bannerUrls?.length ||
          0,
        categoryShowcase: configuration?.homepage?.categoryShowcase?.length || 0,
        homepageSections: Object.values(configuration?.homepage?.sections || {}).filter(Boolean)
          .length,
      },
      categories,
      configuration,
    };
  }
}

export default new ConfigurationService();
