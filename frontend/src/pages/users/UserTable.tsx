import { Eye, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import DataTable, { TableColumn } from "../../components/DataTable";
import { useAuth } from "../../context/AuthContext";
import {
  deleteUser,
  getUser,
  type PageRecord,
  searchTenants,
  type TenantOption,
  updateUser,
} from "../../services/appDataService";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Shop Admin" | "Member";
  roleValue: "super_admin" | "admin" | "member";
  tenant: string;
  tenantId: string;
  status: "Active" | "Inactive" | "Suspended";
  statusValue: "active" | "inactive" | "suspended";
  lastLogin: string;
  joined: string;
};

type UserTableProps = {
  users: PageRecord[];
  onRefresh: () => void;
};

const formatText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const formatDate = (value: unknown) => {
  if (typeof value !== "string") return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const getRoleValue = (role: unknown): UserRow["roleValue"] => {
  if (role === "super_admin" || role === "admin" || role === "member") {
    return role;
  }

  return "member";
};

const formatRole = (role: UserRow["roleValue"]): UserRow["role"] => {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Shop Admin";
  return "Member";
};

const getStatusValue = (status: unknown): UserRow["statusValue"] => {
  if (status === "inactive" || status === "suspended") return status;
  return "active";
};

const formatStatus = (status: UserRow["statusValue"]): UserRow["status"] => {
  if (status === "inactive") return "Inactive";
  if (status === "suspended") return "Suspended";
  return "Active";
};

const mapUser = (user: PageRecord): UserRow => {
  const roleValue = getRoleValue(user.role);
  const statusValue = getStatusValue(user.status);
  const tenantId = formatText(user.tenantId);

  return {
    id: formatText(user.id || user._id),
    name: formatText(user.name),
    email: formatText(user.email),
    role: formatRole(roleValue),
    roleValue,
    tenant: tenantId === "-" ? "Platform" : tenantId,
    tenantId: tenantId === "-" ? "" : tenantId,
    status: formatStatus(statusValue),
    statusValue,
    lastLogin: formatDate(user.lastLoginAt),
    joined: formatDate(user.createdAt),
  };
};

const roleClass: Record<UserRow["role"], string> = {
  "Super Admin": "table-badge badge-blue",
  "Shop Admin": "table-badge badge-cyan",
  Member: "table-badge badge-gray",
};

const statusClass: Record<UserRow["status"], string> = {
  Active: "table-badge badge-green",
  Inactive: "table-badge badge-gray",
  Suspended: "table-badge badge-red",
};

const columns: TableColumn<UserRow>[] = [
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
  { key: "tenant", header: "Tenant" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={statusClass[row.status]}>{row.status}</span>
    ),
  },
  { key: "lastLogin", header: "Last Login" },
  { key: "joined", header: "Joined" },
];

const UserTable = ({ onRefresh, users }: UserTableProps) => {
  const { token, user } = useAuth();
  const rows = users.map(mapUser);
  const [activeUser, setActiveUser] = useState<UserRow | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "member" as UserRow["roleValue"],
    tenantId: "",
    status: "active" as UserRow["statusValue"],
  });
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const canChooseTenant = user?.role === "super_admin";

  useEffect(() => {
    if (!token || !canChooseTenant || mode !== "edit") return;

    const timeoutId = window.setTimeout(async () => {
      setIsLoadingTenants(true);

      try {
        const nextTenants = await searchTenants(token, tenantSearch);
        setTenants(nextTenants);
      } catch (tenantError) {
        setTenants([]);
        setError(
          tenantError instanceof Error ? tenantError.message : "Unable to load tenants",
        );
      } finally {
        setIsLoadingTenants(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [canChooseTenant, mode, tenantSearch, token]);

  const openView = async (row: UserRow) => {
    if (!token) return;

    setError("");
    const response = await getUser(row.id, token);
    setActiveUser(mapUser(response.user));
    setMode("view");
  };

  const openEdit = async (row: UserRow) => {
    if (!token) return;

    setError("");
    const response = await getUser(row.id, token);
    const nextUser = mapUser(response.user);
    setActiveUser(nextUser);
    setForm({
      name: nextUser.name,
      email: nextUser.email,
      role: nextUser.roleValue,
      tenantId: nextUser.tenantId,
      status: nextUser.statusValue,
    });
    setMode("edit");
  };

  const closeModal = () => {
    setActiveUser(null);
    setMode(null);
    setError("");
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleDelete = async (row: UserRow) => {
    if (!token) return;
    const confirmed = window.confirm(`Delete user "${row.name}"?`);

    if (!confirmed) return;

    await deleteUser(row.id, token);
    onRefresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !activeUser) return;

    setIsSaving(true);
    setError("");

    try {
      await updateUser(
        activeUser.id,
        {
          name: form.name,
          email: form.email,
          role: form.role,
          tenantId: form.tenantId || undefined,
          status: form.status,
        },
        token,
      );
      onRefresh();
      closeModal();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        rowKey="id"
        total={rows.length}
        page={1}
        limit={7}
        renderActions={(row, index) => (
          <div className={`row-action-menu ${index >= rows.length - 2 ? "menu-up" : ""}`}>
            <button
              className="action-button"
              onClick={() => setOpenMenuId((current) => current === row.id ? null : row.id)}
              title="User actions"
              type="button"
            >
              <MoreHorizontal size={22} />
            </button>
            {openMenuId === row.id && (
              <div className="row-action-popover">
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    openView(row);
                  }}
                  type="button"
                >
                  <Eye size={17} />
                  View
                </button>
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    openEdit(row);
                  }}
                  type="button"
                >
                  <Pencil size={17} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    handleDelete(row);
                  }}
                  type="button"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      />

      {activeUser && mode === "view" && (
        <div className="modal-backdrop" role="presentation">
          <section className="entity-modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeModal} type="button">Close</button>
            </div>
            <div className="details-grid">
              <strong>Name</strong><span>{activeUser.name}</span>
              <strong>Email</strong><span>{activeUser.email}</span>
              <strong>Role</strong><span>{activeUser.role}</span>
              <strong>Tenant</strong><span>{activeUser.tenant}</span>
              <strong>Status</strong><span>{activeUser.status}</span>
              <strong>Last Login</strong><span>{activeUser.lastLogin}</span>
              <strong>Joined</strong><span>{activeUser.joined}</span>
            </div>
          </section>
        </div>
      )}

      {activeUser && mode === "edit" && (
        <div className="modal-backdrop" role="presentation">
          <form className="entity-modal" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={closeModal} type="button">Close</button>
            </div>

            {error && <div className="content-message error">{error}</div>}

            <div className="modal-grid">
              <label className="field">
                <span>Name</span>
                <input onChange={(event) => updateField("name", event.target.value)} required value={form.name} />
              </label>
              <label className="field">
                <span>Email</span>
                <input onChange={(event) => updateField("email", event.target.value)} required type="email" value={form.email} />
              </label>
              <label className="field">
                <span>Role</span>
                <select onChange={(event) => updateField("role", event.target.value)} value={form.role}>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Shop/Tenant Admin</option>
                  <option value="member">Member</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select onChange={(event) => updateField("status", event.target.value)} value={form.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              {canChooseTenant ? (
                <>
                  <label className="field modal-full-field">
                    <span>Search Tenant</span>
                    <input
                      onChange={(event) => setTenantSearch(event.target.value)}
                      placeholder="Type tenant name"
                      value={tenantSearch}
                    />
                  </label>
                  <label className="field modal-full-field">
                    <span>Tenant</span>
                    <select
                      disabled={isLoadingTenants}
                      onChange={(event) => updateField("tenantId", event.target.value)}
                      value={form.tenantId}
                    >
                      <option value="">Platform user / no tenant</option>
                      {form.tenantId && !tenants.some((tenant) => tenant.id === form.tenantId) && (
                        <option value={form.tenantId}>{activeUser.tenant}</option>
                      )}
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <div className="modal-note modal-full-field">
                  Tenant assignment is managed by the platform admin.
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={closeModal} type="button">Cancel</button>
              <button className="primary-button" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default UserTable;
