import { Mail, MoreHorizontal } from "lucide-react";
import DataTable, { TableColumn } from "../../components/DataTable";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Tenant Admin" | "Admin" | "Tenant User" | "Support";
  tenant: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  joined: string;
};

const users: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@sphere.io",
    role: "Super Admin",
    tenant: "Platform",
    status: "Active",
    lastLogin: "2 hours ago",
    joined: "2024-01-10",
  },
  {
    id: "2",
    name: "Dr. Patel",
    email: "dr.patel@medstore.com",
    role: "Tenant Admin",
    tenant: "Medical Store Pro",
    status: "Active",
    lastLogin: "1 hour ago",
    joined: "2024-01-15",
  },
  {
    id: "3",
    name: "Emma Johnson",
    email: "emma@fashionfw.com",
    role: "Tenant Admin",
    tenant: "Fashion Forward",
    status: "Active",
    lastLogin: "30 minutes ago",
    joined: "2024-02-20",
  },
  {
    id: "4",
    name: "Mike Chen",
    email: "mike@sphere.io",
    role: "Admin",
    tenant: "Platform",
    status: "Active",
    lastLogin: "5 hours ago",
    joined: "2024-01-15",
  },
  {
    id: "5",
    name: "Raj Kumar",
    email: "raj@freshgrocery.com",
    role: "Tenant User",
    tenant: "Fresh Grocery",
    status: "Inactive",
    lastLogin: "8 days ago",
    joined: "2024-03-10",
  },
  {
    id: "6",
    name: "Lisa Wong",
    email: "lisa@techelectro.com",
    role: "Tenant Admin",
    tenant: "Tech Electronics",
    status: "Active",
    lastLogin: "3 hours ago",
    joined: "2024-04-05",
  },
  {
    id: "7",
    name: "Elena Rodriguez",
    email: "elena@sphere.io",
    role: "Support",
    tenant: "Platform",
    status: "Active",
    lastLogin: "Just now",
    joined: "2024-01-20",
  },
];

const roleClass: Record<User["role"], string> = {
  "Super Admin": "table-badge badge-blue",
  "Tenant Admin": "table-badge badge-cyan",
  Admin: "table-badge badge-purple",
  "Tenant User": "table-badge badge-gray",
  Support: "table-badge badge-orange",
};

const statusClass: Record<User["status"], string> = {
  Active: "table-badge badge-green",
  Inactive: "table-badge badge-gray",
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

const UserTable = () => {
  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey="id"
      total={3247}
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
