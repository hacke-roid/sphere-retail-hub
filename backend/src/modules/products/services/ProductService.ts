import ProductRepository from "../repositories/ProductRepository";

class ProductService {
  create(tenantId: string, input: Record<string, unknown>) {
    return ProductRepository.create({ ...input, tenantId });
  }

  list(tenantId: string, query: Record<string, string | undefined>) {
    return ProductRepository.list({
      tenantId,
      categoryId: query.categoryId,
      search: query.search,
      featured: query.featured === "true" ? true : undefined,
      availableOnly: query.availableOnly !== "false",
    });
  }

  async pageData(tenantId: string, query: Record<string, string | undefined>) {
    const products = await this.list(tenantId, query);

    return {
      metrics: {
        totalProducts: products.length,
        availableProducts: products.filter((product) => product.isAvailable).length,
        featuredProducts: products.filter((product) => product.isFeatured).length,
        outOfStockProducts: products.filter(
          (product) => (product.stockQuantity || 0) <= 0,
        ).length,
      },
      products,
    };
  }

  getById(tenantId: string, id: string) {
    return ProductRepository.findById(tenantId, id);
  }

  update(tenantId: string, id: string, input: Record<string, unknown>) {
    return ProductRepository.update(tenantId, id, input);
  }

  delete(tenantId: string, id: string) {
    return ProductRepository.delete(tenantId, id);
  }
}

export default new ProductService();
