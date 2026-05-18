export type Tenant = {
  id: string;
  name: string;
  email: string;
  type: string;
  owner: string;
  subscription: "Premium" | "Pro" | "Starter" | "Trial";
  status: "Active" | "Trial" | "Suspended";
  revenue: string;
};
