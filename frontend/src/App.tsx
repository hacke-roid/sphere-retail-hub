import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import MemberLayout from "./layouts/MemberLayout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/member/AccountPage";
import OrdersPage from "./pages/member/OrdersPage";
import ShopPage from "./pages/member/ShopPage";
import WishlistPage from "./pages/member/WishlistPage";
import SignupPage from "./pages/SignupPage";
import UnauthorizedPage from "./pages/Unauthorized";
import AnalyticsRouter from "./routers/analytics";
import CategoriesRouter from "./routers/categories";
import ConfigurationRouter from "./routers/configuration";
import DashboardRouter from "./routers/dashboard";
import ProductsRouter from "./routers/products";
import ProfileRouter from "./routers/profile";
import SettingsRouter from "./routers/settings";
import TenantsRouter from "./routers/tenants";
import UsersRouter from "./routers/users";
import { Loader } from "./components/Loader";

const AppShell = () => {
  const { hasAssignedRole, isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader message="Preparing your workspace" />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!hasAssignedRole()) {
    return (
      <Routes>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    );
  }

  if (isAuthenticated && hasAssignedRole()) {
    if (user?.role === "member") {
      return (
        <MemberLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="/dashboard" element={<Navigate to="/shop" replace />} />
            <Route path="/products" element={<Navigate to="/shop" replace />} />
            <Route path="/profile" element={<Navigate to="/account" replace />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<Navigate to="/shop" replace />} />
            <Route path="/signup" element={<Navigate to="/shop" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/shop" replace />} />
            <Route path="*" element={<Navigate to="/shop" replace />} />
          </Routes>
        </MemberLayout>
      );
    }
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <TenantsRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <UsersRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["admin", "member"]}>
              <ProductsRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CategoriesRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuration"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ConfigurationRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <AnalyticsRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SettingsRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <ProfileRouter />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
