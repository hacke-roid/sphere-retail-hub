import { Box, Heart, LogOut, Search, ShoppingCart, User } from "lucide-react";
import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type MemberLayoutProps = {
  children: ReactNode;
};

const initials = (name?: string) =>
  (name || "Member")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className="member-shell">
      <header className="member-header">
        <NavLink className="member-brand" to="/shop">
          <span className="member-brand-mark">⌁</span>
          <strong>Medical Store Pro</strong>
        </NavLink>

        <label className="member-search">
          <Search size={20} />
          <input placeholder="Search products..." />
        </label>

        <div className="member-header-actions">
          <NavLink className="member-cart-button" to="/orders">
            <ShoppingCart size={27} />
            <span>2</span>
          </NavLink>

          <div className="member-profile-menu">
            <button
              className="member-avatar"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              {initials(user?.name)}
            </button>

            {isMenuOpen && (
              <div className="member-menu-popover">
                <NavLink onClick={() => setIsMenuOpen(false)} to="/account">
                  <User size={28} />
                  My Account
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/orders">
                  <Box size={28} />
                  My Orders
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/wishlist">
                  <Heart size={28} />
                  Wishlist
                </NavLink>
                <button onClick={logout} type="button">
                  <LogOut size={28} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="member-page-scroll">{children}</main>
    </section>
  );
};

export default MemberLayout;
