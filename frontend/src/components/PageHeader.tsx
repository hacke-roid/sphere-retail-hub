import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
