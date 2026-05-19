import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  getMemberWishlist,
  removeMemberWishlistItem,
  type MemberProduct,
} from "../../services/memberService";

const WishlistPage = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<MemberProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadWishlist = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getMemberWishlist(token);

        if (isMounted) {
          setWishlist(response.wishlist);
        }
      } catch (wishlistError) {
        if (isMounted) {
          setError(
            wishlistError instanceof Error
              ? wishlistError.message
              : "Unable to load wishlist",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleRemove = async (productId: string) => {
    if (!token) return;

    const response = await removeMemberWishlistItem(token, productId);
    setWishlist(response.wishlist);
  };

  if (isLoading) {
    return (
      <div className="member-inner-page">
        <Loader message="Loading wishlist" variant="inline" />
      </div>
    );
  }

  if (error) {
    return <div className="member-inner-page content-message error">{error}</div>;
  }

  return (
    <div className="member-inner-page">
      <div className="member-page-heading">
        <h1>Wishlist</h1>
        <p>Products you saved for later.</p>
      </div>

      {wishlist.length ? (
        <div className="member-wishlist-grid">
          {wishlist.map((product) => (
            <article className="wishlist-card" key={product.id}>
              <div className="wishlist-visual">{product.icon}</div>
              <div>
                <p>{product.categoryName}</p>
                <h2>{product.name}</h2>
                <strong>
                  {new Intl.NumberFormat("en-US", {
                    currency: "USD",
                    style: "currency",
                  }).format(product.price)}
                </strong>
              </div>
              <div className="wishlist-actions">
                <button onClick={() => handleRemove(product.id)} type="button">
                  <Heart size={20} />
                  Remove
                </button>
                <button className="primary-button" disabled={!product.isAvailable} type="button">
                  <ShoppingCart size={20} />
                  {product.isAvailable ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="member-empty-helper">
          <Heart size={42} />
          <h2>No wishlist items</h2>
          <p>Save products from the shop and they will appear here.</p>
        </section>
      )}
    </div>
  );
};

export default WishlistPage;
