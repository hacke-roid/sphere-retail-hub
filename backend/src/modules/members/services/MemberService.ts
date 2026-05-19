import MemberRepository from "../repositories/MemberRepository";
import ConfigurationRepository from "../../configurations/repositories/ConfigurationRepository";

type MemberRequester = {
  id: string;
  tenantId?: string;
};

const requireTenantId = (requester: MemberRequester) => {
  if (!requester.tenantId) {
    throw new Error("Member account is not assigned to a tenant");
  }

  return requester.tenantId;
};

class MemberService {
  async dashboard(requester: MemberRequester) {
    const tenantId = requireTenantId(requester);
    const [shopName, categories, featuredProducts, allProducts, wishlist, configuration] =
      await Promise.all([
        MemberRepository.getTenantName(tenantId),
        MemberRepository.listCategories(tenantId),
        MemberRepository.listProducts(tenantId, { featuredOnly: true }),
        MemberRepository.listProducts(tenantId),
        MemberRepository.listWishlist(requester.id, tenantId),
        ConfigurationRepository.getByTenantId(tenantId),
      ]);
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const configuredBanners =
      configuration?.homepage?.sections?.bannerCarousel === false
        ? []
        : (configuration?.homepage?.banners || []).map((banner, index) => ({
            id: banner.id || `banner-${index + 1}`,
            title: banner.title,
            subtitle: banner.subtitle || "",
            imageUrl: banner.imageUrl,
            buttonLabel: banner.buttonLabel || "Shop Now",
            categoryId: banner.categoryId,
            icon: index % 2 ? "✨" : "☀️",
            tone: banner.tone || (index % 2 ? "pink" : "blue"),
          }));
    const configuredCategories =
      configuration?.homepage?.sections?.categoryShowcase === false
        ? []
        : (configuration?.homepage?.categoryShowcase || [])
            .map((item) => {
              const category = categoriesById.get(item.categoryId);

              if (!category) return undefined;

              return {
                ...category,
                name: item.title || category.name,
                imageUrl: item.imageUrl,
              };
            })
            .filter(Boolean);
    const resolvedFeaturedProducts =
      configuration?.homepage?.sections?.featuredProducts === false
        ? []
        : featuredProducts.length
          ? featuredProducts
          : allProducts;

    return {
      shop: {
        id: tenantId,
        name: configuration?.shopName || shopName,
      },
      theme: configuration?.theme || {},
      features: configuration?.features || {},
      layout: {
        productsPerRow: configuration?.homepage?.productsPerRow || 3,
        itemsPerPage: configuration?.homepage?.itemsPerPage || 12,
      },
      banners: configuredBanners.length
        ? configuredBanners
        : configuration?.homepage?.sections?.bannerCarousel === false
          ? []
          : [
              {
                id: "summer-health-sale",
                title: "Summer Health Sale",
                subtitle: "Up to 40% off on all supplements",
                icon: "☀️",
                tone: "blue",
              },
              {
                id: "new-arrivals",
                title: "New Arrivals",
                subtitle: "Latest medical devices now in stock",
                icon: "✨",
                tone: "pink",
              },
            ],
      categories: configuredCategories.length ? configuredCategories : categories,
      featuredProducts: resolvedFeaturedProducts,
      wishlistProductIds: wishlist.map((product) => product.id),
    };
  }

  orders(requester: MemberRequester) {
    const tenantId = requireTenantId(requester);

    return MemberRepository.listOrders(requester.id, tenantId);
  }

  wishlist(requester: MemberRequester) {
    const tenantId = requireTenantId(requester);

    return MemberRepository.listWishlist(requester.id, tenantId);
  }

  async addWishlistItem(requester: MemberRequester, productId: string) {
    const tenantId = requireTenantId(requester);

    await MemberRepository.addWishlistItem(requester.id, tenantId, productId);
    return this.wishlist(requester);
  }

  async removeWishlistItem(requester: MemberRequester, productId: string) {
    await MemberRepository.removeWishlistItem(requester.id, productId);
    return this.wishlist(requester);
  }
}

export default new MemberService();
