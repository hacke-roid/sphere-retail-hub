import React, { useMemo, useState } from "react";
import { AuthUser } from "../../types/auth";
import { ActivityIcon, Building2, TrendingUp, User2 } from "lucide-react";
import StatCard from "../../components/StatCard";
import UserTable from "./UserTable";

const metricConfig = {
  super_admin: [
    ["Total Tenants", "totalTenants", Building2],
    ["Active Shops", "activeTenants", ActivityIcon],
    ["Total Revenue", "totalRevenue", TrendingUp],
    ["Active Users", "activeUsers", User2],
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

const Users = ({ user }: { user: AuthUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ [key: string]: number | undefined }>(
    {},
  );
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
            trend={isLoading ? "Loading..." : "Live data"}
            value={isLoading ? "..." : value}
          />
        ))}
      </section>
      <UserTable />
    </>
  );
};

export default Users;
