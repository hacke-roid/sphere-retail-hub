import ConfigurationRepository from "../repositories/ConfigurationRepository";

class ConfigurationService {
  get(tenantId: string) {
    return ConfigurationRepository.getByTenantId(tenantId);
  }

  save(tenantId: string, input: Record<string, unknown>) {
    return ConfigurationRepository.upsert(tenantId, input);
  }
}

export default new ConfigurationService();
