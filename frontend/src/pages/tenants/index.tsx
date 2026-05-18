import React, { useMemo, useState } from "react";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { TenantMetrics } from "../../services/appDataService";
import { ActivityIcon, Building2, TrendingUp, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthUser } from "../../types/auth";
import TenantTable from "./TenantTable";

const metricConfig = {
  super_admin: [
    ["Total Tenants", "totalTenants", Building2],
    ["Active Shops", "activeTenants", ActivityIcon],
    ["Trial Users", "totalRevenue", TrendingUp],
    ["Platform Users", "activeUsers", Users],
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

const Tenants = ({ user }: { user: AuthUser }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ [key: string]: number | undefined }>(
    {},
  );
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
            trend={isLoading ? "Loading..." : "Live data"}
            value={isLoading ? "..." : value}
          />
        ))}
      </section>
      <TenantTable />
    </>
  );
};

export default Tenants;
