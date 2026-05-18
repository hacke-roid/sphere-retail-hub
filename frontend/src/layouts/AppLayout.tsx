import { Bell, Crown, LogOut, Menu } from "lucide-react";
import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { navItems } from "../config/navigation";
import { useAuth } from "../context/AuthContext";

type AppLayoutProps = {
  children: ReactNode;
};

const roleLabel = {
  super_admin: "Super Admin",
  admin: "Shop Admin",
  member: "Member",
};

const roleDescription = {
  super_admin: "Platform Owner",
  admin: "Tenant Owner",
  member: "Customer",
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "member"),
  );
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={isMobileMenuOpen ? "app-shell menu-open" : "app-shell"}>
      <button
        aria-label="Close navigation"
        className="mobile-menu-backdrop"
        onClick={closeMobileMenu}
        type="button"
      />

      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="brand-mark">S</span>
          <strong>Sphere</strong>
        </div>

        <nav className="app-nav">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-nav-item active" : "app-nav-item"
                }
                end
                to={item.path}
                key={item.id}
                onClick={closeMobileMenu}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="logout-button" onClick={logout} type="button">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <section className="app-workspace">
        <header className="app-header">
          <button
            aria-label="Open navigation"
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(true)}
            type="button"
          >
            <Menu size={32} />
          </button>

          <div className="app-header-spacer" />

          <button className="icon-button" type="button">
            <Bell size={20} />
            <span />
          </button>
          {user && (
            <div className="account-pill">
              <Crown className="mini-crown" size={19} />
              <div>
                <strong>{roleLabel[user.role]}</strong>
                <p>{roleDescription[user.role]}</p>
              </div>
            </div>
          )}
        </header>
        <main className="app-page-scroll">{children}</main>
      </section>
    </div>
  );
};

export default AppLayout;
