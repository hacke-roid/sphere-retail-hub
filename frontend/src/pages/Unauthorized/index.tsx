import { Link } from "react-router-dom";

const UnauthorizedPage = () => (
  <main className="app-loading">
    <section className="unauthorized-card">
      <h1>Unauthorized</h1>
      <p>You do not have permission to open this page.</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </section>
  </main>
);

export default UnauthorizedPage;
