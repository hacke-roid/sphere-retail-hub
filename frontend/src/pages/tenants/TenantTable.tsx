import DataTable, {
  DefaultActionButton,
  TableColumn,
} from "../../components/DataTable";

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

const tenants: Tenant[] = [
  {
    id: "1",
    name: "Medical Store Pro",
    email: "dr.patel@medstore.com",
    type: "Medical",
    owner: "Dr. Patel",
    subscription: "Premium",
    status: "Active",
    revenue: "$12,500",
  },
];

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

const TenantTable = () => {
  return (
    <DataTable
      columns={columns}
      data={tenants}
      rowKey="id"
      total={128}
      page={1}
      limit={5}
      renderActions={() => <DefaultActionButton />}
    />
  );
};

export default TenantTable;
