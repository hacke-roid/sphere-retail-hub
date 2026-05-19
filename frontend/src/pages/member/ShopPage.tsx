import { ChevronRight, Heart, ShoppingCart } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  addMemberWishlistItem,
  getMemberDashboard,
  type MemberDashboard,
  type MemberProduct,
  removeMemberWishlistItem,
} from "../../services/memberService";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);

const Stars = ({ rating }: { rating: number }) => (
  <span className="product-stars">
    {"★★★★★".split("").map((star, index) => (
      <i className={index < rating ? "active" : ""} key={`${star}-${index}`}>
        ★
      </i>
    ))}
  </span>
);

const ProductCard = ({
  isWishlisted,
  onWishlistToggle,
  product,
}: {
  isWishlisted: boolean;
  onWishlistToggle: (product: MemberProduct) => void;
  product: MemberProduct;
}) => (
  <article className="member-product-card">
    <div className={product.isAvailable ? "product-visual" : "product-visual out"}>
      <span>{product.isAvailable ? product.icon : "Out of Stock"}</span>
    </div>
    <div className="product-body">
      <p>{product.categoryName}</p>
      <h3>{product.name}</h3>
      <div className="product-rating">
        <Stars rating={product.rating} />
        <span>({product.reviews})</span>
      </div>
      <div className="product-price-row">
        <strong>{formatCurrency(product.price)}</strong>
        <button
          className={isWishlisted ? "wishlisted" : ""}
          onClick={() => onWishlistToggle(product)}
          type="button"
        >
          <Heart size={20} />
        </button>
      </div>
      <button className="product-cart-button" disabled={!product.isAvailable} type="button">
        <ShoppingCart size={21} />
        {product.isAvailable ? "Add to Cart" : "Unavailable"}
      </button>
    </div>
  </article>
);

const ShopPage = () => {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<MemberDashboard | null>(null);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getMemberDashboard(token);

        if (isMounted) {
          setDashboard(response.dashboard);
          setWishlistProductIds(response.dashboard.wishlistProductIds);
        }
      } catch (dashboardError) {
        if (isMounted) {
          setError(
            dashboardError instanceof Error
              ? dashboardError.message
              : "Unable to load shop dashboard",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleWishlistToggle = async (product: MemberProduct) => {
    if (!token) return;

    const isWishlisted = wishlistProductIds.includes(product.id);
    const response = isWishlisted
      ? await removeMemberWishlistItem(token, product.id)
      : await addMemberWishlistItem(token, product.id);

    setWishlistProductIds(response.wishlist.map((wishlistProduct) => wishlistProduct.id));
  };

  if (isLoading) {
    return (
      <div className="member-inner-page">
        <Loader message="Loading shop" variant="inline" />
      </div>
    );
  }

  if (error) {
    return <div className="member-inner-page content-message error">{error}</div>;
  }

  if (!dashboard) {
    return <div className="member-inner-page content-message">No shop data found</div>;
  }

  return (
    <div className="member-shop-page">
      <section className="shop-hero-grid">
        {dashboard.banners.map((banner) => (
          <article
            className={`shop-promo-card ${banner.tone === "pink" ? "promo-pink" : "promo-blue"}`}
            key={banner.id}
            style={
              banner.imageUrl
                ? {
                    backgroundImage: `linear-gradient(90deg, rgba(47, 85, 212, 0.78), rgba(6, 182, 212, 0.42)), url(${banner.imageUrl})`,
                  }
                : undefined
            }
          >
            <span>{banner.icon}</span>
            <h1>{banner.title}</h1>
            <p>{banner.subtitle}</p>
            <button type="button">
              {banner.buttonLabel || "Shop Now"}
              <ChevronRight size={20} />
            </button>
          </article>
        ))}
      </section>

      <section className="shop-section">
        <div className="shop-section-header">
          <h2>Shop by Category</h2>
          <button type="button">
            View All
            <ChevronRight size={18} />
          </button>
        </div>
        {dashboard.categories.length ? (
          <div className="shop-category-grid">
            {dashboard.categories.map((category) => (
              <article className={`shop-category-card ${category.tone}`} key={category.id}>
                <span>
                  {category.imageUrl ? <img src={category.imageUrl} alt="" /> : category.icon}
                </span>
                <strong>{category.name}</strong>
              </article>
            ))}
          </div>
        ) : (
          <div className="member-empty-helper">No categories are available yet.</div>
        )}
      </section>

      <section className="shop-section">
        <div className="shop-section-header">
          <h2>Featured Products</h2>
          <button type="button">
            View All
            <ChevronRight size={18} />
          </button>
        </div>
        {dashboard.featuredProducts.length ? (
          <div
            className="product-grid"
            style={{
              "--member-products-per-row": dashboard.layout?.productsPerRow || 3,
            } as CSSProperties}
          >
            {dashboard.featuredProducts
              .slice(0, dashboard.layout?.itemsPerPage || 12)
              .map((product) => (
              <ProductCard
                isWishlisted={wishlistProductIds.includes(product.id)}
                key={product.id}
                onWishlistToggle={handleWishlistToggle}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="member-empty-helper">No products are available yet.</div>
        )}
      </section>
    </div>
  );
};

export default ShopPage;
