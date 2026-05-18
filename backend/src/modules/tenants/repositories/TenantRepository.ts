import TenantModel, { TenantDocument } from "../models/Tenant";

export type TenantRecord = {
  id: string;
  name: string;
  type: string;
  ownerName: string;
  ownerEmail: string;
  subscriptionPlan: string;
  status: string;
  revenue: number;
  createdAt: string;
};

const toTenantRecord = (tenant: TenantDocument): TenantRecord => ({
  id: tenant._id.toString(),
  name: tenant.name,
  type: tenant.type,
  ownerName: tenant.ownerName,
  ownerEmail: tenant.ownerEmail,
  subscriptionPlan: tenant.subscriptionPlan,
  status: tenant.status,
  revenue: tenant.revenue,
  createdAt: tenant.createdAt.toISOString(),
});

class TenantRepository {
  async create(input: Record<string, unknown>) {
    const tenant = await TenantModel.create(input);

    return toTenantRecord(tenant);
  }

  async list(filter: { search?: string; status?: string; type?: string }) {
    const query: Record<string, unknown> = {};

    if (filter.status) query.status = filter.status;
    if (filter.type) query.type = filter.type;
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { ownerEmail: { $regex: filter.search, $options: "i" } },
      ];
    }

    const tenants = await TenantModel.find(query).sort({ createdAt: -1 }).exec();

    return tenants.map(toTenantRecord);
  }

  async findById(id: string) {
    const tenant = await TenantModel.findById(id).exec();

    return tenant ? toTenantRecord(tenant) : undefined;
  }

  async update(id: string, input: Record<string, unknown>) {
    const tenant = await TenantModel.findByIdAndUpdate(id, input, {
      new: true,
    }).exec();

    return tenant ? toTenantRecord(tenant) : undefined;
  }

  async delete(id: string) {
    await TenantModel.findByIdAndDelete(id).exec();
  }

  async countByStatus(status?: string) {
    const query: Record<string, unknown> = status ? { status } : {};

    return TenantModel.countDocuments(query).exec();
  }

  async aggregateByType() {
    return TenantModel.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", count: 1 } },
    ]).exec();
  }

  async aggregateBySubscription() {
    return TenantModel.aggregate([
      { $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } },
      { $project: { _id: 0, plan: "$_id", count: 1 } },
    ]).exec();
  }
}

export default new TenantRepository();
