import { ComponentType, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getViewRecords, type ApiRecord } from "../services/appDataService";
import type { AppView } from "../types/navigation";
import type { AuthUser } from "../types/auth";

import Tenants from "./tenants";
import Users from "./users";
import Products from "./products";
import Analytics from "./analytics";
import Settings from "./settings";

type PageComponentProps = {
  user: AuthUser;
  records: ApiRecord[];
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
  analytics: {
    title: "Analytics",
    subtitle: "View growth, revenue, subscriptions, and traffic sources",
    component: Analytics,
  },
  settings: {
    title: "Settings",
    subtitle: "Manage platform configuration",
    component: Settings,
  },
};

const PlaceholderPage = ({ view }: { view: AppView }) => {
  const { token, user } = useAuth();

  const page = labels[view];

  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadRecords = async () => {
      setIsLoading(true);
      setError("");

      try {
        const nextRecords = await getViewRecords(view, token, user);

        if (isMounted) {
          setRecords(nextRecords);
        }
      } catch (recordsError) {
        if (isMounted) {
          setRecords([]);
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

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, [token, user, view]);

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
      <PageHeader title={page.title} subtitle={page.subtitle} />

      {isLoading && <div className="content-message">Loading...</div>}

      {!isLoading && error && (
        <div className="content-message error">{error}</div>
      )}

      {!isLoading && !error && <PageComponent user={user} records={records} />}
    </main>
  );
};

export default PlaceholderPage;
