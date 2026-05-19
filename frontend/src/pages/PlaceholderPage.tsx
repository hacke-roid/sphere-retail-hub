import { ComponentType, useEffect, useState } from "react";
import { CalendarDays, Download, Plus } from "lucide-react";
import AddTenantModal from "../components/AddTenantModal";
import AddUserModal from "../components/AddUserModal";
import { Loader } from "../components/Loader";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  getPageData,
  type PageMetrics,
  type PageRecord,
} from "../services/appDataService";
import type { AppView } from "../types/navigation";
import type { AuthUser } from "../types/auth";

import Tenants from "./tenants";
import Users from "./users";
import Products from "./products";
import Categories from "./categories";
import Analytics from "./analytics";
import Settings from "./settings";
import Configuration from "./configuration";
import RecordsPage from "./RecordsPage";

type PageComponentProps = {
  user: AuthUser;
  metrics: PageMetrics;
  records: PageRecord[];
  raw: Record<string, unknown>;
  onRefresh: () => void;
};

type PageLabel = {
  title: string;
  subtitle: string;
  component: ComponentType<PageComponentProps>;
};

const labels: Partial<Record<AppView, PageLabel>> = {
  tenants: {
    title: "Tenants Management",
    subtitle: "Manage all platform tenants and subscriptions",
    component: Tenants,
  },
  users: {
    title: "Users Management",
    subtitle: "View and manage users based on your role",
    component: Users,
  },
  products: {
    title: "Products",
    subtitle: "Manage or browse product catalog",
    component: Products,
  },
  categories: {
    title: "Categories",
    subtitle: "Create nested catalog categories",
    component: Categories,
  },
  configuration: {
    title: "Shop Configuration",
    subtitle: "Configure your shop appearance and features for the member portal",
    component: Configuration,
  },
  analytics: {
    title: "Platform Analytics",
    subtitle: "View detailed platform analytics and insights",
    component: Analytics,
  },
  settings: {
    title: "Settings",
    subtitle: "Manage platform configuration",
    component: Settings,
  },
  profile: {
    title: "Profile",
    subtitle: "Manage your member profile",
    component: RecordsPage,
  },
};

const PlaceholderPage = ({ view }: { view: AppView }) => {
  const { token, user } = useAuth();

  const page = labels[view];

  const [metrics, setMetrics] = useState<PageMetrics>({});
  const [records, setRecords] = useState<PageRecord[]>([]);
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState<"tenant" | "user" | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPageData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const pageData = await getPageData(view, token, user);

        if (isMounted) {
          setMetrics(pageData.metrics);
          setRecords(pageData.records);
          setRaw(pageData.raw);
        }
      } catch (recordsError) {
        if (isMounted) {
          setMetrics({});
          setRecords([]);
          setRaw({});
          setError(
            recordsError instanceof Error
              ? recordsError.message
              : "Unable to load records",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [token, user, view, refreshKey]);

  if (!page) {
    return (
      <main className="page-content">
        <div className="content-message error">Page not found</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-content">
        <div className="content-message error">User not found</div>
      </main>
    );
  }

  const PageComponent = page.component;

  return (
    <main className="page-content">
      <PageHeader title={page.title} subtitle={page.subtitle}>
        <div className="page-header-actions">
          {view === "analytics" && (
            <>
              <button className="secondary-action-button" type="button">
                <CalendarDays size={18} />
                June 2024
              </button>
              <button className="secondary-action-button" type="button">
                <Download size={18} />
                Export
              </button>
            </>
          )}
          {view === "tenants" && (
            <button
              className="page-primary-action"
              onClick={() => setActiveModal("tenant")}
              type="button"
            >
              <Plus size={24} />
              Add Tenant
            </button>
          )}
          {view === "users" && (
            <button
              className="page-primary-action"
              onClick={() => setActiveModal("user")}
              type="button"
            >
              <Plus size={24} />
              Add User
            </button>
          )}
        </div>
      </PageHeader>

      {isLoading && <Loader message={`Loading ${page.title}`} variant="inline" />}

      {!isLoading && error && (
        <div className="content-message error">{error}</div>
      )}

      {!isLoading && !error && (
        <PageComponent
          user={user}
          metrics={metrics}
          records={records}
          raw={raw}
          onRefresh={() => setRefreshKey((current) => current + 1)}
        />
      )}

      {token && activeModal === "tenant" && (
        <AddTenantModal
          onClose={() => setActiveModal(null)}
          onCreated={() => setRefreshKey((current) => current + 1)}
          token={token}
        />
      )}

      {token && activeModal === "user" && (
        <AddUserModal
          onClose={() => setActiveModal(null)}
          onCreated={() => setRefreshKey((current) => current + 1)}
          token={token}
          user={user}
        />
      )}
    </main>
  );
};

export default PlaceholderPage;
