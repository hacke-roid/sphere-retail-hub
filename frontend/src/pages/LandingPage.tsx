import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Shield,
  ShoppingCart,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Multi-Tenant",
    copy: "Support unlimited shops and retail businesses",
  },
  {
    icon: ShoppingCart,
    title: "Product Management",
    copy: "Manage products, categories, and inventory",
  },
  {
    icon: Users,
    title: "User Management",
    copy: "Role-based access control for teams",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    copy: "Real-time insights and performance metrics",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    copy: "Lightning-fast performance on all devices",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    copy: "Bank-grade security and data protection",
  },
];

const LandingPage = () => (
  <main className="public-page">
    <header className="landing-header">
      <Link className="landing-brand" to="/">
        <span className="brand-mark">S</span>
        <strong>Sphere</strong>
      </Link>
      <Link className="primary-button landing-signin" to="/login">
        Sign In
      </Link>
    </header>

    <section className="landing-hero">
      <span className="hero-pill">Welcome to Sphere Platform</span>
      <h1>Premium Multi-Tenant Retail Platform</h1>
      <p>
        A modern, scalable SaaS solution for managing multiple retail businesses.
        Support medical shops, clothing stores, grocery stores, electronics stores,
        and more.
      </p>
      <div className="landing-hero-actions">
        <Link className="primary-button hero-button" to="/signup">
          Get Started
          <ArrowRight size={20} />
        </Link>
        <a className="secondary-hero-button" href="#features">
          View Demo
        </a>
      </div>
    </section>

    <section className="landing-features" id="features">
      <div className="landing-section-heading">
        <h2>Powerful Features</h2>
        <p>Everything you need to manage your retail platform efficiently</p>
      </div>

      <div className="feature-grid">
        {features.map(({ copy, icon: Icon, title }) => (
          <article className="feature-card" key={title}>
            <span>
              <Icon size={30} />
            </span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="landing-retail-band">
      <div className="retail-copy">
        <h2>Built for Modern Retail</h2>
        {[
          "Modern, clean UI design",
          "Responsive on all devices",
          "Production-ready components",
          "Scalable architecture",
        ].map((item) => (
          <p key={item}>
            <CheckCircle2 size={26} />
            {item}
          </p>
        ))}
      </div>

      <article className="dashboard-preview-card">
        <div className="dashboard-preview-visual">
          <Building2 size={96} />
        </div>
        <h3>Dashboard Preview</h3>
        <p>Modern analytics dashboard with real-time insights</p>
      </article>
    </section>

    <section className="landing-cta">
      <h2>Ready to Transform Your Retail Business?</h2>
      <p>
        Join hundreds of retail businesses using Sphere to streamline their
        operations
      </p>
      <Link className="primary-button hero-button" to="/signup">
        Start Free Trial
        <ArrowRight size={20} />
      </Link>
    </section>
  </main>
);

export default LandingPage;
