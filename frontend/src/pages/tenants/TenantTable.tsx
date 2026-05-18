import DataTable, {
  DefaultActionButton,
  TableColumn,
} from "../../components/DataTable";
import type { PageRecord } from "../../services/appDataService";

type Tenant = {
  id: string;
  name: string;
  email: string;
  type: string;
  owner: string;
  subscription: string;
  status: string;
  revenue: string;
};

const formatText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(typeof value === "number" ? value : Number(value) || 0);

const mapTenant = (tenant: PageRecord): Tenant => ({
  id: formatText(tenant.id || tenant._id),
  name: formatText(tenant.name),
  email: formatText(tenant.ownerEmail || tenant.email),
  type: formatText(tenant.type),
  owner: formatText(tenant.ownerName),
  subscription: formatText(tenant.subscriptionPlan),
  status: formatText(tenant.status),
  revenue: formatCurrency(tenant.revenue),
});

const columns: TableColumn<Tenant>[] = [
  {
    key: "name",
    header: "Tenant Name",
    render: (row) => (
      <>
        <div className="table-primary-text">{row.name}</div>
        <div className="table-secondary-text">{row.email}</div>
      </>
    ),
  },
  { key: "type", header: "Type" },
  { key: "owner", header: "Owner" },
  {
    key: "subscription",
    header: "Subscription",
    render: (row) => (
      <span className="table-badge badge-blue">{row.subscription}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className="table-badge badge-green">{row.status}</span>
    ),
  },
  {
    key: "revenue",
    header: "Revenue",
    render: (row) => <span className="table-strong">{row.revenue}</span>,
  },
];

const TenantTable = ({ tenants }: { tenants: PageRecord[] }) => {
  const rows = tenants.map(mapTenant);

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey="id"
      total={rows.length}
      page={1}
      limit={5}
      renderActions={() => <DefaultActionButton />}
    />
  );
};

export default TenantTable;
