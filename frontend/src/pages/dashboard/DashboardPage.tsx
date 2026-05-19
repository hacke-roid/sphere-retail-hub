import { Activity, Building2, Package, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Loader } from "../../components/Loader";
import StatCard from "../../components/StatCard";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboard,
  type DashboardMetrics,
} from "../../services/appDataService";
import type { AuthUser } from "../../types/auth";

const copy = {
  super_admin: {
    title: "Platform Dashboard service",
    subtitle: "Welcome back! Here's your platform overview",
  },
  admin: {
    title: "Shop Dashboard",
    subtitle: "Manage your storefront, catalog, and customers",
  },
  member: {
    title: "Member Dashboard",
    subtitle: "Browse products, favorites, and account activity",
  },
} as const;

const metricConfig = {
  super_admin: [
    ["Total Tenants", "totalTenants", Building2],
    ["Active Shops", "activeTenants", Activity],
    ["Total Revenue", "totalRevenue", TrendingUp],
    ["Active Users", "activeUsers", Users],
  ],
  admin: [
    ["Products", "products", Package],
    ["Featured Products", "featuredProducts", Activity],
    ["Members", "members", Users],
    ["Total Revenue", "totalRevenue", TrendingUp],
  ],
  member: [
    ["Products", "products", Package],
    ["Featured Products", "featuredProducts", Activity],
    ["Wishlist", "wishlist", Users],
    ["Offers", "offers", TrendingUp],
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

const DashboardPage = ({ user }: { user: AuthUser }) => {
  const { token } = useAuth();
  const page = copy[user.role];
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [tenantTypes, setTenantTypes] = useState<
    Array<{ type: string; count: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getDashboard(user, token);
        const dashboard = response.dashboard || response.analytics;

        if (isMounted) {
          setMetrics(dashboard?.metrics || {});
          setTenantTypes(dashboard?.tenantTypes || []);
        }
      } catch (dashboardError) {
        if (isMounted) {
          setMetrics({});
          setTenantTypes([]);
          setError(
            dashboardError instanceof Error
              ? dashboardError.message
              : "Unable to load dashboard",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const stats = useMemo(
    () =>
      metricConfig[user.role].map(([label, key, icon]) => ({
        icon,
        label,
        value: formatMetric(label, metrics[key]),
      })),
    [metrics, user.role],
  );

  return (
    <main className="page-content">
      <PageHeader title={page.title} subtitle={page.subtitle} />

      {error && <div className="content-message error">{error}</div>}

      {isLoading ? (
        <Loader message="Loading dashboard" variant="inline" />
      ) : (
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

          <section className="dashboard-grid">
            <article className="chart-card revenue-card">
              <h2>Revenue Trend</h2>
              <p>Monthly revenue from recorded transactions</p>
              <div className="empty-panel">No revenue records yet</div>
            </article>

            <article className="chart-card">
              <h2>{user.role === "member" ? "Product Types" : "Tenant Types"}</h2>
              <p>Distribution by category</p>
              {tenantTypes.length ? (
                <ul className="chart-legend data-list">
                  {tenantTypes.map((item) => (
                    <li key={item.type}>
                      <span className="dot blue" />
                      {item.type}
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-panel">No category data yet</div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default DashboardPage;
