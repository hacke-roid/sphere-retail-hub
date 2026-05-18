import { FormEvent, useEffect, useState } from "react";
import { createUser, searchTenants, type TenantOption } from "../services/appDataService";
import type { AuthUser } from "../types/auth";

type AddUserModalProps = {
  onClose: () => void;
  onCreated: () => void;
  token: string;
  user: AuthUser;
};

const AddUserModal = ({ onClose, onCreated, token, user }: AddUserModalProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "member" as "admin" | "member",
    tenantId: "",
  });
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const canChooseTenant = user.role === "super_admin";

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  useEffect(() => {
    if (!canChooseTenant) return;

    const timeoutId = window.setTimeout(async () => {
      setIsLoadingTenants(true);
      try {
        const nextTenants = await searchTenants(token, tenantSearch);
        setTenants(nextTenants);
        setForm((current) => ({
          ...current,
          tenantId: current.tenantId || nextTenants[0]?.id || "",
        }));
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
  }, [canChooseTenant, tenantSearch, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createUser(
        {
          name: form.name,
          email: form.email,
          role: form.role,
          tenantId: canChooseTenant ? form.tenantId || undefined : undefined,
        },
        token,
      );
      onCreated();
      onClose();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Unable to create user",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="entity-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Add User</h2>
          <button onClick={onClose} type="button">Close</button>
        </div>

        {error && <div className="content-message error">{error}</div>}

        <div className="modal-grid">
          <label className="field">
            <span>Name</span>
            <input
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Role</span>
            <select
              onChange={(event) =>
                updateField("role", event.target.value as "admin" | "member")
              }
              value={form.role}
            >
              <option value="admin">Shop/Tenant Admin</option>
              <option value="member">Member</option>
            </select>
          </label>

          {canChooseTenant ? (
            <>
              <label className="field">
                <span>Search Tenant</span>
                <input
                  onChange={(event) => setTenantSearch(event.target.value)}
                  placeholder="Type tenant name"
                  value={tenantSearch}
                />
              </label>

              <label className="field">
                <span>Tenant</span>
                <select
                  disabled={isLoadingTenants || tenants.length === 0}
                  onChange={(event) => updateField("tenantId", event.target.value)}
                  required
                  value={form.tenantId}
                >
                  {tenants.length === 0 && (
                    <option value="">
                      {isLoadingTenants ? "Loading tenants..." : "No tenants found"}
                    </option>
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
              User will be added to your assigned tenant. The temporary password will be emailed.
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserModal;
