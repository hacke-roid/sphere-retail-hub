import {
  Bell,
  Camera,
  CreditCard,
  Database,
  Globe2,
  Save,
  Shield,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { PageMetrics, PageRecord } from "../../services/appDataService";
import type { AuthUser } from "../../types/auth";

type SettingsProps = {
  user: AuthUser;
  metrics: PageMetrics;
  records: PageRecord[];
};

const sections = [
  {
    id: "general",
    title: "General",
    description: "Platform name, timezone, and language",
    icon: Globe2,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email and system notification preferences",
    icon: Bell,
  },
  {
    id: "security",
    title: "Security",
    description: "Password policies and authentication settings",
    icon: Shield,
  },
  {
    id: "team",
    title: "Team",
    description: "Team members and access control",
    icon: Users,
  },
  {
    id: "billing",
    title: "Billing",
    description: "Payment methods and subscription",
    icon: CreditCard,
  },
  {
    id: "data",
    title: "Data",
    description: "Data retention and export options",
    icon: Database,
  },
] as const;

type SectionId = (typeof sections)[number]["id"];

const Toggle = ({ checked = true }: { checked?: boolean }) => (
  <button
    aria-pressed={checked}
    className={checked ? "settings-toggle active" : "settings-toggle"}
    type="button"
  >
    <span />
  </button>
);

const Settings = ({ records }: SettingsProps) => {
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const teamRecords = useMemo(
    () =>
      records.length
        ? records.slice(0, 5)
        : [
            {
              id: "owner",
              name: "Super Admin",
              email: "superadmin@example.com",
              role: "Super Admin",
            },
          ],
    [records],
  );

  return (
    <section className="settings-page">
      <div className="settings-section-grid">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              className={
                activeSection === section.id
                  ? "settings-section-card active"
                  : "settings-section-card"
              }
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <span className="settings-section-icon">
                <Icon size={28} />
              </span>
              <strong>{section.title}</strong>
              <p>{section.description}</p>
            </button>
          );
        })}
      </div>

      {activeSection === "general" && (
        <article className="settings-panel">
          <h2>General Settings</h2>
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>Platform Name</span>
              <input defaultValue="Sphere Platform" />
            </label>
            <label className="settings-field">
              <span>Support Email</span>
              <input defaultValue="support@sphere.io" />
            </label>
            <label className="settings-field">
              <span>Timezone</span>
              <select defaultValue="UTC (Coordinated Universal Time)">
                <option>UTC (Coordinated Universal Time)</option>
                <option>Asia/Kolkata</option>
                <option>America/New_York</option>
              </select>
            </label>
            <label className="settings-field">
              <span>Language</span>
              <select defaultValue="English">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </label>
          </div>
          <div className="settings-divider" />
          <h3>Platform Logo</h3>
          <button className="upload-box" type="button">
            <span>
              <Camera size={22} />
            </span>
            <strong>Click to upload</strong>
            <small>or drag and drop</small>
          </button>
          <div className="settings-actions">
            <button className="primary-button" type="button">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </article>
      )}

      {activeSection === "notifications" && (
        <article className="settings-panel">
          <h2>Notification Preferences</h2>
          {[
            [
              "New Tenant Registration",
              "Get notified when a new tenant signs up",
              true,
            ],
            [
              "Payment Received",
              "Notify when subscription payments are received",
              true,
            ],
            ["System Alerts", "Critical system and security alerts", true],
            ["Weekly Report", "Weekly platform activity summary", false],
            ["User Activity", "Notify on unusual user activity", false],
          ].map(([title, description, enabled]) => (
            <div className="settings-row" key={String(title)}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <Toggle checked={Boolean(enabled)} />
            </div>
          ))}
          <div className="settings-actions">
            <button className="primary-button" type="button">
              <Save size={18} />
              Save Preferences
            </button>
          </div>
        </article>
      )}

      {activeSection === "security" && (
        <article className="settings-panel">
          <h2>Security Settings</h2>
          <div className="warning-box">
            <strong>Two-Factor Authentication</strong>
            <p>Enable 2FA for all admin accounts to improve security</p>
            <button type="button">Enable 2FA</button>
          </div>
          <div className="settings-divider" />
          <h3>Password Policy</h3>
          <div className="settings-row">
            <div>
              <strong>Minimum Length</strong>
              <p>Minimum password length</p>
            </div>
            <select className="compact-select" defaultValue="12 chars">
              <option>8 chars</option>
              <option>12 chars</option>
              <option>16 chars</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>Require Special Characters</strong>
              <p>Force use of !@#$%^&*</p>
            </div>
            <Toggle />
          </div>
          <div className="settings-row">
            <div>
              <strong>Require Numbers</strong>
              <p>Passwords must contain numbers</p>
            </div>
            <Toggle />
          </div>
          <div className="settings-divider" />
          <h3>Session Management</h3>
          <div className="settings-row">
            <div>
              <strong>Session Timeout</strong>
              <p>Logout inactive users after</p>
            </div>
            <select className="compact-select" defaultValue="30 minutes">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
          </div>
          <div className="settings-actions">
            <button className="primary-button" type="button">
              <Save size={18} />
              Save Security Settings
            </button>
          </div>
        </article>
      )}

      {activeSection === "team" && (
        <article className="settings-panel">
          <h2>Team Management</h2>
          <h3>Team Members</h3>
          <div className="team-list">
            {teamRecords.map((member, index) => (
              <div className="team-member-row" key={String(member.id || index)}>
                <div>
                  <strong>{String(member.name || "Team Member")}</strong>
                  <p>{String(member.email || "")}</p>
                </div>
                <span>{String(member.role || "Member")}</span>
                <button type="button">⋮</button>
              </div>
            ))}
          </div>
          <div className="settings-actions">
            <button className="primary-button" type="button">
              Add Team Member
            </button>
          </div>
        </article>
      )}

      {activeSection === "billing" && (
        <article className="settings-panel">
          <h2>Billing & Subscription</h2>
          <div className="billing-plan">
            <span>Current Plan</span>
            <strong>Enterprise Plan</strong>
            <p>$9,999/month - Unlimited tenants & users</p>
            <p>
              Your subscription renews on <b>May 15, 2025</b>
            </p>
            <button className="primary-button" type="button">
              Manage Subscription
            </button>
          </div>
          <div className="settings-divider" />
          <h3>Billing History</h3>
          {["April 15, 2024", "March 15, 2024", "February 15, 2024"].map(
            (date, index) => (
              <div className="billing-row" key={date}>
                <div>
                  <strong>{date}</strong>
                  <p>Invoice #{1001 - index}</p>
                </div>
                <strong>$9,999</strong>
                <button type="button">Download</button>
              </div>
            ),
          )}
        </article>
      )}

      {activeSection === "data" && (
        <article className="settings-panel">
          <h2>Data Management</h2>
          <div className="danger-box">
            <strong>Danger Zone</strong>
            <p>These actions are irreversible. Please proceed with caution.</p>
            <button type="button">Export All Data</button>
          </div>
          <div className="settings-divider" />
          <h3>Data Retention</h3>
          <div className="settings-row">
            <div>
              <strong>Retain Deleted Tenant Data</strong>
              <p>Days to keep data after deletion</p>
            </div>
            <select className="compact-select" defaultValue="30 days">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
            </select>
          </div>
          <div className="settings-actions">
            <button className="primary-button" type="button">
              <Save size={18} />
              Save Data Settings
            </button>
          </div>
        </article>
      )}
    </section>
  );
};

export default Settings;
