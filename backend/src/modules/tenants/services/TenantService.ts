import TenantRepository from "../repositories/TenantRepository";
import UserModel from "../../users/models/User";

class TenantService {
  create(input: Record<string, unknown>) {
    return TenantRepository.create(input);
  }

  list(query: Record<string, string | undefined>) {
    return TenantRepository.list({
      search: query.search,
      status: query.status,
      type: query.type,
    });
  }

  getById(id: string) {
    return TenantRepository.findById(id);
  }

  update(id: string, input: Record<string, unknown>) {
    return TenantRepository.update(id, input);
  }

  updateStatus(id: string, status: string) {
    return TenantRepository.update(id, { status });
  }

  delete(id: string) {
    return TenantRepository.delete(id);
  }

  async pageData(query: Record<string, string | undefined>) {
    const [tenants, totalTenants, activeTenants, trialTenants, platformUsers] =
      await Promise.all([
        this.list(query),
        TenantRepository.countByStatus(),
        TenantRepository.countByStatus("active"),
        TenantRepository.countByStatus("trial"),
        UserModel.countDocuments({}).exec(),
      ]);

    return {
      metrics: {
        totalTenants,
        activeTenants,
        trialTenants,
        platformUsers,
      },
      tenants,
    };
  }
}

export default new TenantService();
