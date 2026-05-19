import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/appDataService";

const AccountPage = () => {
  const { refreshUser, token, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !user) return;

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await updateUser(
        user.id,
        {
          name: form.name,
          email: form.email,
          role: user.role,
          tenantId: user.tenantId,
          status: user.status as "active" | "inactive" | "suspended" | undefined,
        },
        token,
      );
      await refreshUser();
      setMessage("Account details updated");
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : "Unable to update account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="member-inner-page">
      <div className="member-page-heading">
        <h1>My Account</h1>
        <p>Manage your profile, contact details, and delivery preferences.</p>
      </div>

      <form className="member-account-card" onSubmit={handleSubmit}>
        <div className="member-account-avatar">{(user?.name || "M").slice(0, 2).toUpperCase()}</div>

        <div className="modal-grid">
          <label className="field">
            <span>Full Name</span>
            <input
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>
          <label className="field">
            <span>Email Address</span>
            <input
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="field">
            <span>Phone Number</span>
            <input
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+1 555 0100"
              value={form.phone}
            />
          </label>
          <label className="field">
            <span>Delivery Address</span>
            <input
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Street, city, state"
              value={form.address}
            />
          </label>
        </div>

        {message && <div className="content-message success">{message}</div>}
        {error && <div className="content-message error">{error}</div>}

        <div className="settings-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountPage;
