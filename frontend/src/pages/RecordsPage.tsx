import { BarChart3 } from "lucide-react";
import DataTable, { TableColumn } from "../components/DataTable";
import StatCard from "../components/StatCard";
import type { PageMetrics, PageRecord } from "../services/appDataService";
import type { AuthUser } from "../types/auth";

type RecordsPageProps = {
  user: AuthUser;
  metrics: PageMetrics;
  records: PageRecord[];
};

const formatText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());

const columns: TableColumn<PageRecord>[] = [
  {
    key: "name",
    header: "Name",
    render: (row) => formatText(row.name || row.key || row.shopName),
  },
  {
    key: "detail",
    header: "Details",
    render: (row) =>
      formatText(row.email || row.ownerEmail || row.type || row.role || row.tenantId),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => formatText(row.status || row.isActive || row.isAvailable),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (row) => formatText(row.createdAt),
  },
];

const RecordsPage = ({ metrics, records }: RecordsPageProps) => {
  const metricEntries = Object.entries(metrics);

  return (
    <>
      {metricEntries.length > 0 && (
        <section className="stats-grid">
          {metricEntries.slice(0, 4).map(([key, value]) => (
            <StatCard
              icon={BarChart3}
              key={key}
              label={formatLabel(key)}
              trend="Live data"
              value={new Intl.NumberFormat("en-US").format(value || 0)}
            />
          ))}
        </section>
      )}

      <DataTable columns={columns} data={records} rowKey="id" />
    </>
  );
};

export default RecordsPage;
