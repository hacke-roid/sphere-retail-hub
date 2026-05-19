import ShopConfigurationModel from "../models/ShopConfiguration";

class ConfigurationRepository {
  async getByTenantId(tenantId: string) {
    return ShopConfigurationModel.findOne({ tenantId }).lean().exec();
  }

  async upsert(tenantId: string, input: Record<string, unknown>) {
    return ShopConfigurationModel.findOneAndUpdate(
      { tenantId },
      { $set: { ...input, tenantId } },
      { new: true, upsert: true },
    )
      .lean()
      .exec();
  }
}

export default new ConfigurationRepository();
