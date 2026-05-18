import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardPage from "../../pages/dashboard/DashboardPage";

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardPage user={user} />;
};

export default DashboardRouter;
