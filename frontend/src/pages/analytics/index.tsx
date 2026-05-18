import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import StatCard from "../../components/StatCard";
import type { PageMetrics, PageRecord } from "../../services/appDataService";
import type { AuthUser } from "../../types/auth";

type AnalyticsPageProps = {
  user: AuthUser;
  metrics: PageMetrics;
  records: PageRecord[];
  raw: Record<string, unknown>;
  onRefresh: () => void;
};

type SeriesPoint = Record<string, unknown> & {
  month?: string;
  label?: string;
  revenue?: number;
  users?: number;
  tenants?: number;
  visits?: number;
};

type SubscriptionSlice = {
  plan?: string;
  count?: number;
};

type TopTenant = {
  id?: string;
  name?: string;
  users?: number;
  revenue?: number;
};

const colors = ["#4168dc", "#8b48f2", "#0ea5e9", "#f59e0b", "#22c55e"];

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(value)}`;
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const linePoints = (
  data: SeriesPoint[],
  key: "revenue" | "users" | "tenants",
  width: number,
  height: number,
) => {
  const values = data.map((item) => numberValue(item[key]));
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * height;

      return `${x},${y}`;
    })
    .join(" ");
};

const LineChart = ({
  data,
  keys,
  labels,
}: {
  data: SeriesPoint[];
  keys: Array<"revenue" | "users" | "tenants">;
  labels: string[];
}) => {
  if (!data.length || keys.every((key) => data.every((item) => !numberValue(item[key])))) {
    return <div className="analytics-empty-chart">No trend data yet</div>;
  }

  return (
    <div className="analytics-line-frame">
      <svg aria-hidden="true" className="analytics-line-svg" viewBox="0 0 640 260">
        <g className="analytics-grid-lines">
          {[0, 1, 2, 3, 4].map((line) => (
            <line key={line} x1="0" x2="640" y1={line * 65} y2={line * 65} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <line key={line} x1={line * 128} x2={line * 128} y1="0" y2="260" />
          ))}
        </g>
        {keys.map((key, index) => (
          <polyline
            fill="none"
            key={key}
            points={linePoints(data, key, 640, 260)}
            stroke={colors[index]}
            strokeWidth="3"
          />
        ))}
      </svg>
      <div className="analytics-chart-labels">
        {data.map((item, index) => (
          <span key={`${item.month || item.label || index}`}>
            {item.month || item.label || index + 1}
          </span>
        ))}
      </div>
      <div className="analytics-chart-legend">
        {labels.map((label, index) => (
          <span key={label}>
            <i style={{ background: colors[index] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ data }: { data: SubscriptionSlice[] }) => {
  const total = data.reduce((sum, item) => sum + numberValue(item.count), 0);

  if (!total) {
    return <div className="analytics-empty-chart">No subscription data yet</div>;
  }

  let start = 0;
  const gradient = data
    .map((item, index) => {
      const size = (numberValue(item.count) / total) * 100;
      const segment = `${colors[index % colors.length]} ${start}% ${start + size}%`;
      start += size;
      return segment;
    })
    .join(", ");

  return (
    <>
      <div className="analytics-donut" style={{ background: `conic-gradient(${gradient})` }} />
      <ul className="chart-legend analytics-legend-list">
        {data.map((item, index) => (
          <li key={item.plan || index}>
            <span className="dot" style={{ background: colors[index % colors.length] }} />
            {titleCase(String(item.plan || "Plan"))}
            <strong>{numberValue(item.count)}</strong>
          </li>
        ))}
      </ul>
    </>
  );
};

const TopTenantsList = ({ tenants }: { tenants: TopTenant[] }) => {
  const maxRevenue = Math.max(...tenants.map((tenant) => numberValue(tenant.revenue)), 1);

  if (!tenants.length) {
    return <div className="analytics-empty-chart">No tenant revenue data yet</div>;
  }

  return (
    <div className="analytics-tenant-list">
      {tenants.map((tenant) => {
        const revenue = numberValue(tenant.revenue);
        const width = `${Math.max((revenue / maxRevenue) * 100, revenue ? 4 : 1)}%`;

        return (
          <div className="analytics-tenant-row" key={tenant.id || tenant.name}>
            <div>
              <strong>{tenant.name || "Unnamed Tenant"}</strong>
              <span>{formatNumber(numberValue(tenant.users))} users</span>
            </div>
            <div className="analytics-progress-track">
              <span style={{ width }} />
            </div>
            <strong>{formatCurrency(revenue)}</strong>
          </div>
        );
      })}
    </div>
  );
};

const TrafficSources = ({ data }: { data: SeriesPoint[] }) => {
  const maxVisits = Math.max(...data.map((item) => numberValue(item.visits)), 1);

  if (!data.length || data.every((item) => !numberValue(item.visits))) {
    return <div className="analytics-empty-chart">No traffic source data yet</div>;
  }

  return (
    <div className="analytics-bar-frame">
      {data.map((item, index) => (
        <div className="analytics-bar-column" key={item.label || index}>
          <span style={{ height: `${(numberValue(item.visits) / maxVisits) * 100}%` }} />
          <small>{item.label || index + 1}</small>
        </div>
      ))}
    </div>
  );
};

const Analytics = ({ metrics, raw }: AnalyticsPageProps) => {
  const revenueTrend = useMemo(
    () => asArray<SeriesPoint>(raw.revenueTrend),
    [raw.revenueTrend],
  );
  const userTenantGrowth = useMemo(
    () => asArray<SeriesPoint>(raw.userTenantGrowth),
    [raw.userTenantGrowth],
  );
  const subscriptions = useMemo(
    () => asArray<SubscriptionSlice>(raw.subscriptions),
    [raw.subscriptions],
  );
  const topTenants = useMemo(
    () => asArray<TopTenant>(raw.topTenants),
    [raw.topTenants],
  );
  const trafficSources = useMemo(
    () => asArray<SeriesPoint>(raw.trafficSources),
    [raw.trafficSources],
  );

  const totalRevenue = numberValue(metrics.totalRevenue);
  const activeUsers = numberValue(metrics.activeUsers);
  const activeTenants = numberValue(metrics.activeTenants);
  const avgTransaction = numberValue(metrics.avgTransaction || metrics.averageTransaction);

  return (
    <div className="analytics-page">
      <section className="stats-grid">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          trend="Live data"
          value={formatCompactCurrency(totalRevenue)}
        />
        <StatCard
          icon={Users}
          label="Active Users"
          trend="Live data"
          value={formatNumber(activeUsers)}
        />
        <StatCard
          icon={ShoppingCart}
          label="Active Tenants"
          trend="Live data"
          value={formatNumber(activeTenants)}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Transaction"
          trend="Live data"
          value={formatCurrency(avgTransaction)}
        />
      </section>

      <section className="analytics-stack">
        <article className="chart-card analytics-wide-card">
          <h2>Revenue Trend</h2>
          <p>Monthly revenue vs target and subscriptions</p>
          <LineChart data={revenueTrend} keys={["revenue"]} labels={["Actual Revenue"]} />
        </article>

        <div className="analytics-two-column">
          <article className="chart-card">
            <h2>User & Tenant Growth</h2>
            <p>Monthly active users and registered tenants</p>
            <LineChart
              data={userTenantGrowth}
              keys={["users", "tenants"]}
              labels={["Users", "Tenants"]}
            />
          </article>

          <article className="chart-card">
            <h2>Subscriptions</h2>
            <p>By plan type</p>
            <DonutChart data={subscriptions} />
          </article>
        </div>

        <article className="chart-card analytics-list-card">
          <h2>Top Tenants by Revenue</h2>
          <p>Highest-performing shops on the platform</p>
          <TopTenantsList tenants={topTenants} />
        </article>

        <article className="chart-card analytics-wide-card">
          <h2>Traffic Sources</h2>
          <p>Platform visits by source</p>
          <TrafficSources data={trafficSources} />
        </article>
      </section>
    </div>
  );
};

export default Analytics;
