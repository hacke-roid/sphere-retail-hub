import { useMemo } from "react";
import StatCard from "../../components/StatCard";
import { ActivityIcon, Building2, TrendingUp, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthUser } from "../../types/auth";
import TenantTable from "./TenantTable";
import type { PageMetrics, PageRecord } from "../../services/appDataService";

const metricConfig = {
  super_admin: [
    ["Total Tenants", "totalTenants", Building2],
    ["Active Shops", "activeTenants", ActivityIcon],
    ["Trial Tenants", "trialTenants", TrendingUp],
    ["Platform Users", "platformUsers", Users],
  ],
} as const;

const formatMetric = (label: string, value: number | undefined) => {
  const safeValue = value || 0;

  if (label.toLowerCase().includes("revenue")) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(safeValue);
  }

  return new Intl.NumberFormat("en-US").format(safeValue);
};

const Tenants = ({
  user,
  metrics,
  records,
  onRefresh,
}: {
  user: AuthUser;
  metrics: PageMetrics;
  records: PageRecord[];
  onRefresh: () => void;
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const stats = useMemo(
    () =>
      metricConfig["super_admin"].map(([label, key, icon]) => ({
        icon,
        label,
        value: formatMetric(label, metrics[key]),
      })),
    [metrics],
  );
  return (
    <>
      <section className="stats-grid">
        {stats.map(({ icon, label, value }) => (
          <StatCard
            icon={icon}
            key={label}
            label={label}
            trend="Live data"
            value={value}
          />
        ))}
      </section>
      <TenantTable onRefresh={onRefresh} tenants={records} />
    </>
  );
};

export default Tenants;
