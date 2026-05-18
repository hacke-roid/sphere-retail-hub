import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
};

const StatCard = ({ icon: Icon, label, trend, value }: StatCardProps) => (
  <article className="stat-card">
    <div className="stat-card-header">
      <span className="stat-icon">
        <Icon size={25} />
      </span>
      <button type="button">...</button>
    </div>
    <p>{label}</p>
    <strong>{value}</strong>
    <em>{trend}</em>
  </article>
);

export default StatCard;
