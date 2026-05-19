import {
  Box,
  Camera,
  Globe2,
  ImagePlus,
  Palette,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  getConfiguration,
  listCategories,
  saveConfiguration,
  type CategoryOption,
  type ShopConfiguration,
  uploadImage,
} from "../../services/appDataService";
import type { AuthUser } from "../../types/auth";

type ConfigurationProps = {
  user: AuthUser;
  onRefresh: () => void;
};

type SectionId = "shop" | "appearance" | "homepage" | "features";

const defaultConfiguration: ShopConfiguration = {
  shopName: "Medical Store Pro",
  logoUrl: "",
  theme: {
    primaryColor: "#4F46E5",
    secondaryColor: "#7C3AED",
    accentColor: "#06B6D4",
    fontFamily: "Inter",
    layout: "modern",
    wideLayout: true,
    cardShadows: true,
    roundedCorners: true,
  },
  contact: {
    email: "contact@medstore.com",
    phone: "+1-555-0123",
    address: "",
  },
  homepage: {
    sections: {
      bannerCarousel: true,
      categoryShowcase: true,
      featuredProducts: true,
      latestProducts: false,
      bestSellers: false,
    },
    productsPerRow: 3,
    itemsPerPage: 12,
    banners: [],
    categoryShowcase: [],
  },
  features: {
    productSearch: true,
    wishlist: true,
    productReviews: true,
    filters: true,
    sorting: true,
    addToCart: false,
    orderHistory: false,
    productRecommendations: false,
  },
};

const sections = [
  {
    id: "shop",
    title: "Shop Info",
    description: "Basic shop details and branding",
    icon: Globe2,
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Colors, theme, and layout settings",
    icon: Palette,
  },
  {
    id: "homepage",
    title: "Homepage",
    description: "Configure storefront sections",
    icon: Box,
  },
  {
    id: "features",
    title: "Features",
    description: "Enable/disable features for members",
    icon: Settings,
  },
] as const;

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    aria-pressed={checked}
    className={checked ? "settings-toggle active" : "settings-toggle"}
    onClick={() => onChange(!checked)}
    type="button"
  >
    <span />
  </button>
);

const mergeConfiguration = (
  configuration: ShopConfiguration | null,
): ShopConfiguration => ({
  ...defaultConfiguration,
  ...(configuration || {}),
  theme: {
    ...defaultConfiguration.theme,
    ...(configuration?.theme || {}),
  },
  contact: {
    ...defaultConfiguration.contact,
    ...(configuration?.contact || {}),
  },
  homepage: {
    ...defaultConfiguration.homepage,
    ...(configuration?.homepage || {}),
    sections: {
      ...defaultConfiguration.homepage.sections,
      ...(configuration?.homepage?.sections || {}),
    },
    banners: configuration?.homepage?.banners || [],
    categoryShowcase: configuration?.homepage?.categoryShowcase || [],
  },
  features: {
    ...defaultConfiguration.features,
    ...(configuration?.features || {}),
  },
});

const Configuration = ({ onRefresh }: ConfigurationProps) => {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("shop");
  const [configuration, setConfiguration] =
    useState<ShopConfiguration>(defaultConfiguration);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [configurationResponse, categoryOptions] = await Promise.all([
          getConfiguration(token),
          listCategories(token),
        ]);

        if (isMounted) {
          setConfiguration(mergeConfiguration(configurationResponse.configuration));
          setCategories(categoryOptions);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load shop configuration",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const updateConfiguration = (next: Partial<ShopConfiguration>) => {
    setConfiguration((current) => ({
      ...current,
      ...next,
    }));
  };

  const updateHomepage = (next: Partial<ShopConfiguration["homepage"]>) => {
    setConfiguration((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        ...next,
      },
    }));
  };

  const updateTheme = (next: Partial<ShopConfiguration["theme"]>) => {
    setConfiguration((current) => ({
      ...current,
      theme: {
        ...current.theme,
        ...next,
      },
    }));
  };

  const updateFeatures = (next: Partial<ShopConfiguration["features"]>) => {
    setConfiguration((current) => ({
      ...current,
      features: {
        ...current.features,
        ...next,
      },
    }));
  };

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
    onImage: (imageUrl: string) => void,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Please upload an image smaller than 5MB");
      return;
    }

    if (!token) return;

    try {
      const response = await uploadImage(file, token);
      onImage(response.upload.url);
      setError("");
      event.target.value = "";
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image");
    }
  };

  const addBanner = () => {
    updateHomepage({
      banners: [
        ...configuration.homepage.banners,
        {
          id: crypto.randomUUID(),
          title: "New Promotion",
          subtitle: "Add your banner message",
          buttonLabel: "Shop Now",
          tone: configuration.homepage.banners.length % 2 ? "pink" : "blue",
        },
      ],
    });
  };

  const addCategoryShowcase = () => {
    const category = categories[0];

    if (!category) {
      setError("Create a category first, then add it to the showcase");
      return;
    }

    updateHomepage({
      categoryShowcase: [
        ...configuration.homepage.categoryShowcase,
        {
          id: crypto.randomUUID(),
          categoryId: category.id,
          imageUrl: category.imageUrl,
          title: category.name,
        },
      ],
    });
  };

  const handleSave = async () => {
    if (!token) return;

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await saveConfiguration(configuration, token);

      setConfiguration(mergeConfiguration(response.configuration));
      setMessage("Configuration saved");
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading shop configuration" variant="inline" />;
  }

  if (error && !configuration) {
    return <div className="content-message error">{error}</div>;
  }

  return (
    <section className="settings-page shop-configuration-page">
      {error && <div className="content-message error">{error}</div>}
      {message && <div className="content-message success">{message}</div>}

      <div className="settings-section-grid shop-config-section-grid">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              className={
                activeSection === section.id
                  ? "settings-section-card active"
                  : "settings-section-card"
              }
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <span className="settings-section-icon">
                <Icon size={28} />
              </span>
              <strong>{section.title}</strong>
              <p>{section.description}</p>
            </button>
          );
        })}
      </div>

      {activeSection === "shop" && (
        <article className="settings-panel">
          <h2>Shop Information</h2>
          <div className="settings-form-grid">
            <label className="settings-field">
              <span>Shop Name</span>
              <input
                value={configuration.shopName}
                onChange={(event) =>
                  updateConfiguration({ shopName: event.target.value })
                }
              />
            </label>
            <label className="settings-field">
              <span>Shop Email</span>
              <input
                value={configuration.contact.email || ""}
                onChange={(event) =>
                  updateConfiguration({
                    contact: { ...configuration.contact, email: event.target.value },
                  })
                }
              />
            </label>
            <label className="settings-field">
              <span>Phone Number</span>
              <input
                value={configuration.contact.phone || ""}
                onChange={(event) =>
                  updateConfiguration({
                    contact: { ...configuration.contact, phone: event.target.value },
                  })
                }
              />
            </label>
            <label className="settings-field">
              <span>Business Type</span>
              <select defaultValue="Medical">
                <option>Medical</option>
                <option>Clothing</option>
                <option>Grocery</option>
                <option>Electronics</option>
              </select>
            </label>
          </div>
          <div className="settings-divider" />
          <h3>Shop Logo</h3>
          <label className="upload-box">
            <input
              accept="image/png,image/jpeg,image/jpg"
              hidden
              onChange={(event) =>
                handleImageChange(event, (logoUrl) =>
                  updateConfiguration({ logoUrl }),
                )
              }
              type="file"
            />
            <span>{configuration.logoUrl ? <img src={configuration.logoUrl} alt="" /> : <Camera size={22} />}</span>
            <strong>Click to upload</strong>
            <small>or drag and drop (PNG, JPG up to 5MB)</small>
          </label>
        </article>
      )}

      {activeSection === "appearance" && (
        <article className="settings-panel">
          <h2>Appearance & Theme</h2>
          <h3>Theme Colors</h3>
          <div className="settings-form-grid color-form-grid">
            {[
              ["primaryColor", "Primary Color"],
              ["secondaryColor", "Secondary Color"],
              ["accentColor", "Accent Color"],
            ].map(([key, label]) => (
              <label className="settings-field color-field" key={key}>
                <span>{label}</span>
                <div>
                  <input
                    aria-label={label}
                    type="color"
                    value={String(configuration.theme[key as keyof typeof configuration.theme])}
                    onChange={(event) =>
                      updateTheme({ [key]: event.target.value })
                    }
                  />
                  <input
                    value={String(configuration.theme[key as keyof typeof configuration.theme])}
                    onChange={(event) =>
                      updateTheme({ [key]: event.target.value })
                    }
                  />
                </div>
              </label>
            ))}
          </div>
          <div className="settings-divider" />
          <h3>Layout Settings</h3>
          {[
            ["wideLayout", "Wide Layout", "Use full width for product grids"],
            ["cardShadows", "Card Shadows", "Enable shadow effects on cards"],
            ["roundedCorners", "Rounded Corners", "Use rounded corners for UI elements"],
          ].map(([key, title, description]) => (
            <div className="settings-row" key={key}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <Toggle
                checked={Boolean(configuration.theme[key as keyof typeof configuration.theme])}
                onChange={(checked) => updateTheme({ [key]: checked })}
              />
            </div>
          ))}
        </article>
      )}

      {activeSection === "homepage" && (
        <article className="settings-panel">
          <h2>Homepage Configuration</h2>
          <h3>Enable/Disable Sections</h3>
          {[
            ["bannerCarousel", "Banner Carousel", "Show promotional banners at the top"],
            ["categoryShowcase", "Category Showcase", "Display shop categories"],
            ["featuredProducts", "Featured Products", "Show featured products grid"],
            ["latestProducts", "Latest Products", "Display newest products"],
            ["bestSellers", "Best Sellers", "Show top-selling products"],
          ].map(([key, title, description]) => (
            <div className="settings-row" key={key}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <Toggle
                checked={configuration.homepage.sections[key as keyof typeof configuration.homepage.sections]}
                onChange={(checked) =>
                  updateHomepage({
                    sections: {
                      ...configuration.homepage.sections,
                      [key]: checked,
                    },
                  })
                }
              />
            </div>
          ))}

          <div className="settings-divider" />
          <div className="configuration-subhead">
            <div>
              <h3>Banner Carousel</h3>
              <p>Upload images and text for member storefront banners.</p>
            </div>
            <button className="secondary-action-button" onClick={addBanner} type="button">
              <Plus size={18} />
              Add Banner
            </button>
          </div>
          <div className="configuration-list">
            {configuration.homepage.banners.map((banner, index) => (
              <div className="configuration-item" key={banner.id}>
                <label className="configuration-image-picker">
                  <input
                    accept="image/png,image/jpeg,image/jpg"
                    hidden
                    onChange={(event) =>
                      handleImageChange(event, (imageUrl) => {
                        const banners = [...configuration.homepage.banners];
                        banners[index] = { ...banner, imageUrl };
                        updateHomepage({ banners });
                      })
                    }
                    type="file"
                  />
                  {banner.imageUrl ? <img src={banner.imageUrl} alt="" /> : <ImagePlus size={24} />}
                </label>
                <div className="configuration-item-form">
                  <input
                    placeholder="Banner title"
                    value={banner.title}
                    onChange={(event) => {
                      const banners = [...configuration.homepage.banners];
                      banners[index] = { ...banner, title: event.target.value };
                      updateHomepage({ banners });
                    }}
                  />
                  <input
                    placeholder="Subtitle"
                    value={banner.subtitle || ""}
                    onChange={(event) => {
                      const banners = [...configuration.homepage.banners];
                      banners[index] = { ...banner, subtitle: event.target.value };
                      updateHomepage({ banners });
                    }}
                  />
                  <select
                    value={banner.categoryId || ""}
                    onChange={(event) => {
                      const banners = [...configuration.homepage.banners];
                      banners[index] = { ...banner, categoryId: event.target.value || undefined };
                      updateHomepage({ banners });
                    }}
                  >
                    <option value="">No category link</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="icon-danger-button"
                  onClick={() =>
                    updateHomepage({
                      banners: configuration.homepage.banners.filter(
                        (item) => item.id !== banner.id,
                      ),
                    })
                  }
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="settings-divider" />
          <div className="configuration-subhead">
            <div>
              <h3>Category Showcase</h3>
              <p>Choose from your existing categories and upload a category image.</p>
            </div>
            <button className="secondary-action-button" onClick={addCategoryShowcase} type="button">
              <Plus size={18} />
              Add Category
            </button>
          </div>
          <div className="configuration-list">
            {configuration.homepage.categoryShowcase.map((item, index) => (
              <div className="configuration-item" key={item.id}>
                <label className="configuration-image-picker">
                  <input
                    accept="image/png,image/jpeg,image/jpg"
                    hidden
                    onChange={(event) =>
                      handleImageChange(event, (imageUrl) => {
                        const categoryShowcase = [...configuration.homepage.categoryShowcase];
                        categoryShowcase[index] = { ...item, imageUrl };
                        updateHomepage({ categoryShowcase });
                      })
                    }
                    type="file"
                  />
                  {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <ImagePlus size={24} />}
                </label>
                <div className="configuration-item-form">
                  <select
                    value={item.categoryId}
                    onChange={(event) => {
                      const categoryShowcase = [...configuration.homepage.categoryShowcase];
                      categoryShowcase[index] = {
                        ...item,
                        categoryId: event.target.value,
                        imageUrl:
                          categories.find((category) => category.id === event.target.value)
                            ?.imageUrl || item.imageUrl,
                        title: categoryNameById.get(event.target.value) || item.title,
                      };
                      updateHomepage({ categoryShowcase });
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Display title"
                    value={item.title || ""}
                    onChange={(event) => {
                      const categoryShowcase = [...configuration.homepage.categoryShowcase];
                      categoryShowcase[index] = { ...item, title: event.target.value };
                      updateHomepage({ categoryShowcase });
                    }}
                  />
                </div>
                <button
                  className="icon-danger-button"
                  onClick={() =>
                    updateHomepage({
                      categoryShowcase: configuration.homepage.categoryShowcase.filter(
                        (showcase) => showcase.id !== item.id,
                      ),
                    })
                  }
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="settings-divider" />
          <h3>Section Settings</h3>
          <label className="settings-field">
            <span>Products Per Row</span>
            <select
              value={configuration.homepage.productsPerRow}
              onChange={(event) =>
                updateHomepage({ productsPerRow: Number(event.target.value) })
              }
            >
              <option value={2}>2 Products</option>
              <option value={3}>3 Products</option>
              <option value={4}>4 Products</option>
            </select>
          </label>
          <label className="settings-field">
            <span>Items Per Page</span>
            <select
              value={configuration.homepage.itemsPerPage}
              onChange={(event) =>
                updateHomepage({ itemsPerPage: Number(event.target.value) })
              }
            >
              <option value={8}>8 Items</option>
              <option value={12}>12 Items</option>
              <option value={24}>24 Items</option>
            </select>
          </label>
        </article>
      )}

      {activeSection === "features" && (
        <article className="settings-panel">
          <h2>Feature Toggles</h2>
          <h3>Member Portal Features</h3>
          {[
            ["productSearch", "Product Search", "Allow members to search for products"],
            ["wishlist", "Wishlist", "Enable wishlist functionality"],
            ["productReviews", "Product Reviews", "Allow members to rate and review products"],
            ["filters", "Filters", "Show category and price filters"],
            ["sorting", "Sorting", "Allow sorting by price, newest, popular"],
            ["addToCart", "Add to Cart", "Enable shopping cart functionality"],
            ["orderHistory", "Order History", "Show member order history"],
            ["productRecommendations", "Product Recommendations", "Show recommended products"],
          ].map(([key, title, description]) => (
            <div className="settings-row" key={key}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <Toggle
                checked={configuration.features[key as keyof typeof configuration.features]}
                onChange={(checked) => updateFeatures({ [key]: checked })}
              />
            </div>
          ))}
        </article>
      )}

      <div className="settings-actions sticky-settings-actions">
        <button className="primary-button" disabled={isSaving} onClick={handleSave} type="button">
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
};

export default Configuration;
