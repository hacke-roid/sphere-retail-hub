import { Mail, MoreHorizontal } from "lucide-react";
import DataTable, { TableColumn } from "../../components/DataTable";
import type { PageRecord } from "../../services/appDataService";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Shop Admin" | "Member";
  tenant: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
  joined: string;
};

const formatText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const formatDate = (value: unknown) => {
  if (typeof value !== "string") return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const formatRole = (role: unknown): User["role"] => {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Shop Admin";
  return "Member";
};

const formatStatus = (status: unknown): User["status"] => {
  if (status === "inactive") return "Inactive";
  if (status === "suspended") return "Suspended";
  return "Active";
};

const mapUser = (user: PageRecord): User => ({
  id: formatText(user.id || user._id),
  name: formatText(user.name),
  email: formatText(user.email),
  role: formatRole(user.role),
  tenant: formatText(user.tenantId) === "-" ? "Platform" : formatText(user.tenantId),
  status: formatStatus(user.status),
  lastLogin: formatDate(user.lastLoginAt),
  joined: formatDate(user.createdAt),
});

const roleClass: Record<User["role"], string> = {
  "Super Admin": "table-badge badge-blue",
  "Shop Admin": "table-badge badge-cyan",
  Member: "table-badge badge-gray",
};

const statusClass: Record<User["status"], string> = {
  Active: "table-badge badge-green",
  Inactive: "table-badge badge-gray",
  Suspended: "table-badge badge-red",
};

const columns: TableColumn<User>[] = [
  {
    key: "name",
    header: "User",
    render: (row) => (
      <>
        <div className="table-primary-text">{row.name}</div>
        <div className="table-secondary-text email-row">
          <Mail size={15} />
          {row.email}
        </div>
      </>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (row) => <span className={roleClass[row.role]}>{row.role}</span>,
  },
  {
    key: "tenant",
    header: "Tenant",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={statusClass[row.status]}>{row.status}</span>
    ),
  },
  {
    key: "lastLogin",
    header: "Last Login",
  },
  {
    key: "joined",
    header: "Joined",
  },
];

const UserTable = ({ users }: { users: PageRecord[] }) => {
  const rows = users.map(mapUser);

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey="id"
      total={rows.length}
      page={1}
      limit={7}
      renderActions={() => (
        <button className="action-button" type="button">
          <MoreHorizontal size={22} />
        </button>
      )}
    />
  );
};

export default UserTable;
