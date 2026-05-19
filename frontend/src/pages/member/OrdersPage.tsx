import { Box, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import { getMemberOrders, type MemberOrder } from "../../services/memberService";

const statusIcon = {
  cancelled: XCircle,
  delivered: CheckCircle2,
  processing: Clock,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const labelFor = (status: MemberOrder["status"]) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getMemberOrders(token);

        if (isMounted) {
          setOrders(response.orders);
        }
      } catch (ordersError) {
        if (isMounted) {
          setError(
            ordersError instanceof Error ? ordersError.message : "Unable to load orders",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="member-inner-page">
        <Loader message="Loading orders" variant="inline" />
      </div>
    );
  }

  if (error) {
    return <div className="member-inner-page content-message error">{error}</div>;
  }

  return (
    <div className="member-inner-page">
      <div className="member-page-heading">
        <h1>My Orders</h1>
        <p>Track purchases, delivery status, and order totals.</p>
      </div>

      {orders.length ? (
        <div className="member-list-card">
          {orders.map((order) => {
            const Icon = statusIcon[order.status];
            const itemSummary = order.items
              .map((item) => `${item.name} x${item.quantity}`)
              .join(", ");

            return (
              <article className="member-order-row" key={order.id}>
                <span className={`member-order-icon ${order.status}`}>
                  <Icon size={28} />
                </span>
                <div>
                  <strong>Order #{order.id.slice(-6).toUpperCase()}</strong>
                  <p>{itemSummary || "Order items unavailable"}</p>
                  <small>{formatDate(order.createdAt)}</small>
                </div>
                <span className={`member-status-pill ${order.status}`}>
                  {labelFor(order.status)}
                </span>
                <strong>{formatCurrency(order.total)}</strong>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="member-empty-helper">
          <Box size={42} />
          <h2>No orders yet</h2>
          <p>Your medicine, supplement, and device purchases will appear here.</p>
        </section>
      )}
    </div>
  );
};

export default OrdersPage;
