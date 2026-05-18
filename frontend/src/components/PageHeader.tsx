import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>

      {children}
    </div>
  );
};

export default PageHeader;
