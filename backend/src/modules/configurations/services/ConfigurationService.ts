import ConfigurationRepository from "../repositories/ConfigurationRepository";

class ConfigurationService {
  get(tenantId: string) {
    return ConfigurationRepository.getByTenantId(tenantId);
  }

  save(tenantId: string, input: Record<string, unknown>) {
    return ConfigurationRepository.upsert(tenantId, input);
  }

  async pageData(tenantId: string) {
    const configuration = await this.get(tenantId);
    const configuredSections = configuration
      ? [
          configuration.shopName,
          configuration.logoUrl,
          configuration.bannerUrls?.length,
          configuration.theme,
          configuration.contact,
          configuration.homepageSections?.length,
        ].filter(Boolean).length
      : 0;

    return {
      metrics: {
        configuredSections,
        bannerImages: configuration?.bannerUrls?.length || 0,
        homepageSections: configuration?.homepageSections?.length || 0,
      },
      configuration,
    };
  }
}

export default new ConfigurationService();
