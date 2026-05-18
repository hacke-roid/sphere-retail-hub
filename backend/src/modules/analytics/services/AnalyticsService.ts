import UserModel from "../../users/models/User";
import ProductModel from "../../products/models/Product";
import TenantRepository from "../../tenants/repositories/TenantRepository";
import TenantModel from "../../tenants/models/Tenant";

class AnalyticsService {
  async getPlatformDashboard() {
    const [totalTenants, activeTenants, totalUsers, activeUsers, tenantTypes] =
      await Promise.all([
        TenantRepository.countByStatus(),
        TenantRepository.countByStatus("active"),
        UserModel.countDocuments({}).exec(),
        UserModel.countDocuments({ status: "active" }).exec(),
        TenantRepository.aggregateByType(),
      ]);

    return {
      metrics: {
        totalTenants,
        activeTenants,
        totalUsers,
        activeUsers,
        totalRevenue: await this.getTotalRevenue(),
      },
      tenantTypes,
      revenueTrend: [],
    };
  }

  async getPlatformAnalytics() {
    const [dashboard, subscriptions, topTenants] = await Promise.all([
      this.getPlatformDashboard(),
      TenantRepository.aggregateBySubscription(),
      TenantModel.find({}).sort({ revenue: -1 }).limit(5).lean().exec(),
    ]);

    return {
      ...dashboard,
      subscriptions,
      userTenantGrowth: [],
      trafficSources: [],
      topTenants: topTenants.map((tenant) => ({
        id: tenant._id.toString(),
        name: tenant.name,
        users: 0,
        revenue: tenant.revenue,
      })),
    };
  }

  async getTenantAnalytics(tenantId: string) {
    const [products, featuredProducts, members] = await Promise.all([
      ProductModel.countDocuments({ tenantId }).exec(),
      ProductModel.countDocuments({ tenantId, isFeatured: true }).exec(),
      UserModel.countDocuments({ tenantId }).exec(),
    ]);

    return {
      metrics: {
        products,
        featuredProducts,
        members,
      },
      productTrend: [],
      trafficSources: [],
    };
  }

  private async getTotalRevenue() {
    const result = await TenantModel.aggregate([
      { $group: { _id: null, total: { $sum: "$revenue" } } },
    ]).exec();

    return result[0]?.total || 0;
  }
}

export default new AnalyticsService();
