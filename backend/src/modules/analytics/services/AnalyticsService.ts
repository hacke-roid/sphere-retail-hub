import UserModel from "../../users/models/User";
import ProductModel from "../../products/models/Product";
import TenantRepository from "../../tenants/repositories/TenantRepository";
import TenantModel from "../../tenants/models/Tenant";

class AnalyticsService {
  async getPlatformDashboard() {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      tenantTypes,
      totalRevenue,
      revenueTrend,
    ] = await Promise.all([
      TenantRepository.countByStatus(),
      TenantRepository.countByStatus("active"),
      UserModel.countDocuments({}).exec(),
      UserModel.countDocuments({ status: "active" }).exec(),
      TenantRepository.aggregateByType(),
      this.getTotalRevenue(),
      this.getRevenueTrend(),
    ]);

    return {
      metrics: {
        totalTenants,
        activeTenants,
        totalUsers,
        activeUsers,
        totalRevenue,
      },
      tenantTypes,
      revenueTrend,
    };
  }

  async getPlatformAnalytics() {
    const [dashboard, subscriptions, topTenants, userTenantGrowth] =
      await Promise.all([
        this.getPlatformDashboard(),
        TenantRepository.aggregateBySubscription(),
        TenantModel.find({}).sort({ revenue: -1 }).limit(5).lean().exec(),
        this.getUserTenantGrowth(),
      ]);
    const topTenantUserCounts = await UserModel.aggregate([
      {
        $match: {
          tenantId: {
            $in: topTenants.map((tenant) => tenant._id.toString()),
          },
        },
      },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]).exec();
    const usersByTenantId = new Map(
      topTenantUserCounts.map((item) => [String(item._id), item.count]),
    );

    return {
      ...dashboard,
      subscriptions,
      userTenantGrowth,
      trafficSources: [],
      topTenants: topTenants.map((tenant) => ({
        id: tenant._id.toString(),
        name: tenant.name,
        users: usersByTenantId.get(tenant._id.toString()) || 0,
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

  private getLastSixMonths() {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

      return {
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
        label: month.toLocaleString("en-US", { month: "short" }),
        month,
        nextMonth,
      };
    });
  }

  private async getRevenueTrend() {
    const months = this.getLastSixMonths();
    const firstMonth = months[0].month;
    const revenueByMonth = await TenantModel.aggregate([
      { $match: { createdAt: { $gte: firstMonth } } },
      {
        $group: {
          _id: { $dateToString: { date: "$createdAt", format: "%Y-%m" } },
          revenue: { $sum: "$revenue" },
        },
      },
    ]).exec();
    const revenueMap = new Map(
      revenueByMonth.map((item) => [String(item._id), Number(item.revenue) || 0]),
    );

    return months.map(({ key, label }) => ({
      month: label,
      revenue: revenueMap.get(key) || 0,
    }));
  }

  private async getUserTenantGrowth() {
    const months = this.getLastSixMonths();

    return Promise.all(
      months.map(async ({ label, nextMonth }) => {
        const [users, tenants] = await Promise.all([
          UserModel.countDocuments({ createdAt: { $lt: nextMonth } }).exec(),
          TenantModel.countDocuments({ createdAt: { $lt: nextMonth } }).exec(),
        ]);

        return {
          month: label,
          users,
          tenants,
        };
      }),
    );
  }
}

export default new AnalyticsService();
