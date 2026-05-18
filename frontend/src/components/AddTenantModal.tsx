import { FormEvent, useState } from "react";
import { createTenant } from "../services/appDataService";

type AddTenantModalProps = {
  onClose: () => void;
  onCreated: () => void;
  token: string;
};

const AddTenantModal = ({ onClose, onCreated, token }: AddTenantModalProps) => {
  const [form, setForm] = useState({
    name: "",
    type: "medical",
    ownerName: "",
    ownerEmail: "",
    subscriptionPlan: "trial",
    status: "trial",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createTenant(form, token);
      onCreated();
      onClose();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Unable to create tenant",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="entity-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Add Tenant</h2>
          <button onClick={onClose} type="button">Close</button>
        </div>

        {error && <div className="content-message error">{error}</div>}

        <div className="modal-grid">
          <label className="field">
            <span>Tenant Name</span>
            <input
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Business Type</span>
            <select
              onChange={(event) => updateField("type", event.target.value)}
              value={form.type}
            >
              <option value="medical">Medical</option>
              <option value="clothing">Clothing</option>
              <option value="grocery">Grocery</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="field">
            <span>Owner Name</span>
            <input
              onChange={(event) => updateField("ownerName", event.target.value)}
              required
              value={form.ownerName}
            />
          </label>

          <label className="field">
            <span>Owner Email</span>
            <input
              onChange={(event) => updateField("ownerEmail", event.target.value)}
              required
              type="email"
              value={form.ownerEmail}
            />
          </label>

          <label className="field">
            <span>Subscription</span>
            <select
              onChange={(event) => updateField("subscriptionPlan", event.target.value)}
              value={form.subscriptionPlan}
            >
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              onChange={(event) => updateField("status", event.target.value)}
              value={form.status}
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTenantModal;
