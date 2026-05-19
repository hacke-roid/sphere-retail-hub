import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import DataTable, { TableColumn } from "../../components/DataTable";
import { useAuth } from "../../context/AuthContext";
import {
  deleteTenant,
  getTenant,
  type PageRecord,
  updateTenant,
} from "../../services/appDataService";

type TenantRow = {
  id: string;
  name: string;
  email: string;
  type: string;
  owner: string;
  ownerName: string;
  ownerEmail: string;
  subscription: string;
  status: string;
  revenue: string;
  revenueValue: number;
  raw: PageRecord;
};

type TenantTableProps = {
  tenants: PageRecord[];
  onRefresh: () => void;
};

const formatText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "-";

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(typeof value === "number" ? value : Number(value) || 0);

const mapTenant = (tenant: PageRecord): TenantRow => {
  const ownerEmail = formatText(tenant.ownerEmail || tenant.email);

  return {
    id: formatText(tenant.id || tenant._id),
    name: formatText(tenant.name),
    email: ownerEmail,
    type: formatText(tenant.type),
    owner: formatText(tenant.ownerName),
    ownerName: formatText(tenant.ownerName),
    ownerEmail,
    subscription: formatText(tenant.subscriptionPlan),
    status: formatText(tenant.status),
    revenue: formatCurrency(tenant.revenue),
    revenueValue: typeof tenant.revenue === "number" ? tenant.revenue : Number(tenant.revenue) || 0,
    raw: tenant,
  };
};

const columns: TableColumn<TenantRow>[] = [
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
      <span className={row.status === "suspended" ? "table-badge badge-red" : "table-badge badge-green"}>
        {row.status}
      </span>
    ),
  },
  {
    key: "revenue",
    header: "Revenue",
    render: (row) => <span className="table-strong">{row.revenue}</span>,
  },
];

const TenantTable = ({ onRefresh, tenants }: TenantTableProps) => {
  const { token } = useAuth();
  const rows = tenants.map(mapTenant);
  const [activeTenant, setActiveTenant] = useState<TenantRow | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "medical",
    ownerName: "",
    ownerEmail: "",
    subscriptionPlan: "trial",
    status: "trial",
    revenue: "0",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openView = async (row: TenantRow) => {
    if (!token) return;

    setError("");
    const response = await getTenant(row.id, token);
    setActiveTenant(mapTenant(response.tenant));
    setMode("view");
  };

  const openEdit = async (row: TenantRow) => {
    if (!token) return;

    setError("");
    const response = await getTenant(row.id, token);
    const tenant = mapTenant(response.tenant);
    setActiveTenant(tenant);
    setForm({
      name: tenant.name,
      type: tenant.type,
      ownerName: tenant.ownerName,
      ownerEmail: tenant.ownerEmail,
      subscriptionPlan: tenant.subscription,
      status: tenant.status,
      revenue: String(tenant.revenueValue),
    });
    setMode("edit");
  };

  const closeModal = () => {
    setActiveTenant(null);
    setMode(null);
    setError("");
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleDelete = async (row: TenantRow) => {
    if (!token) return;
    const confirmed = window.confirm(`Delete tenant "${row.name}"?`);

    if (!confirmed) return;

    await deleteTenant(row.id, token);
    onRefresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !activeTenant) return;

    setIsSaving(true);
    setError("");

    try {
      await updateTenant(
        activeTenant.id,
        {
          ...form,
          revenue: Number(form.revenue) || 0,
        },
        token,
      );
      onRefresh();
      closeModal();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update tenant");
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
        limit={5}
        renderActions={(row, index) => (
          <div className={`row-action-menu ${index >= rows.length - 2 ? "menu-up" : ""}`}>
            <button
              className="action-button"
              onClick={() => setOpenMenuId((current) => current === row.id ? null : row.id)}
              title="Tenant actions"
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

      {activeTenant && mode === "view" && (
        <div className="modal-backdrop" role="presentation">
          <section className="entity-modal">
            <div className="modal-header">
              <h2>Tenant Details</h2>
              <button onClick={closeModal} type="button">Close</button>
            </div>
            <div className="details-grid">
              <strong>Name</strong><span>{activeTenant.name}</span>
              <strong>Owner</strong><span>{activeTenant.ownerName}</span>
              <strong>Email</strong><span>{activeTenant.ownerEmail}</span>
              <strong>Type</strong><span>{activeTenant.type}</span>
              <strong>Subscription</strong><span>{activeTenant.subscription}</span>
              <strong>Status</strong><span>{activeTenant.status}</span>
              <strong>Revenue</strong><span>{activeTenant.revenue}</span>
            </div>
          </section>
        </div>
      )}

      {activeTenant && mode === "edit" && (
        <div className="modal-backdrop" role="presentation">
          <form className="entity-modal" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>Edit Tenant</h2>
              <button onClick={closeModal} type="button">Close</button>
            </div>

            {error && <div className="content-message error">{error}</div>}

            <div className="modal-grid">
              <label className="field">
                <span>Tenant Name</span>
                <input onChange={(event) => updateField("name", event.target.value)} required value={form.name} />
              </label>
              <label className="field">
                <span>Business Type</span>
                <select onChange={(event) => updateField("type", event.target.value)} value={form.type}>
                  <option value="medical">Medical</option>
                  <option value="clothing">Clothing</option>
                  <option value="grocery">Grocery</option>
                  <option value="electronics">Electronics</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field">
                <span>Owner Name</span>
                <input onChange={(event) => updateField("ownerName", event.target.value)} required value={form.ownerName} />
              </label>
              <label className="field">
                <span>Owner Email</span>
                <input onChange={(event) => updateField("ownerEmail", event.target.value)} required type="email" value={form.ownerEmail} />
              </label>
              <label className="field">
                <span>Subscription</span>
                <select onChange={(event) => updateField("subscriptionPlan", event.target.value)} value={form.subscriptionPlan}>
                  <option value="trial">Trial</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select onChange={(event) => updateField("status", event.target.value)} value={form.status}>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="field modal-full-field">
                <span>Revenue</span>
                <input min="0" onChange={(event) => updateField("revenue", event.target.value)} type="number" value={form.revenue} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={closeModal} type="button">Cancel</button>
              <button className="primary-button" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save Tenant"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default TenantTable;
