import {
  Edit3,
  Eye,
  Filter,
  ImagePlus,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "../../components/DataTable";
import { useAuth } from "../../context/AuthContext";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listCategories,
  type CategoryOption,
  type PageMetrics,
  type PageRecord,
  type ProductPayload,
  updateProduct,
  uploadImage,
} from "../../services/appDataService";

type ProductsProps = {
  metrics: PageMetrics;
  records: PageRecord[];
  onRefresh: () => void;
};

type ProductRow = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  image: string;
  price: number;
  stockQuantity: number;
  description: string;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  showStock: boolean;
};

const productIcons = ["💊", "👕", "🍅", "🎧", "🥗", "🩺", "🧴", "💉", "🩹"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(value);

const toText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const toProductRow = (record: PageRecord): ProductRow => {
  const images = Array.isArray(record.images) ? record.images : [];
  const tags = Array.isArray(record.tags) ? record.tags.map(String) : [];

  return {
    id: toText(record.id || record._id),
    name: toText(record.name),
    categoryId: toText(record.categoryId),
    categoryName: toText(record.categoryName) || "Uncategorized",
    image: toText(images[0]),
    price: Number(record.price) || 0,
    stockQuantity: Number(record.stockQuantity) || 0,
    description: toText(record.description),
    tags,
    isAvailable: record.isAvailable !== false,
    isFeatured: record.isFeatured === true,
    showStock: record.showStock !== false,
  };
};

const defaultForm = (): ProductPayload => ({
  name: "",
  categoryId: "",
  description: "",
  images: [],
  price: 0,
  stockQuantity: 0,
  showStock: true,
  isAvailable: true,
  isFeatured: false,
  tags: [],
});

const ProductThumb = ({ product }: { product: ProductRow }) => (
  <div className="product-admin-thumb">
    {product.image ? (
      <img src={product.image} alt="" />
    ) : (
      <span>{productIcons[Math.abs(product.name.length) % productIcons.length]}</span>
    )}
  </div>
);

const ProductModal = ({
  categories,
  initialProduct,
  mode,
  onClose,
  onSaved,
  token,
}: {
  categories: CategoryOption[];
  initialProduct?: ProductRow;
  mode: "create" | "edit" | "view";
  onClose: () => void;
  onSaved: () => void;
  token: string;
}) => {
  const [form, setForm] = useState<ProductPayload>(() =>
    initialProduct
      ? {
          name: initialProduct.name,
          categoryId: initialProduct.categoryId,
          description: initialProduct.description,
          images: initialProduct.image ? [initialProduct.image] : [],
          price: initialProduct.price,
          stockQuantity: initialProduct.stockQuantity,
          showStock: initialProduct.showStock,
          isAvailable: initialProduct.isAvailable,
          isFeatured: initialProduct.isFeatured,
          tags: initialProduct.tags,
        }
      : defaultForm(),
  );
  const [tagText, setTagText] = useState(initialProduct?.tags.join(", ") || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isView = mode === "view";

  const updateField = <K extends keyof ProductPayload>(field: K, value: ProductPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      const response = await uploadImage(file, token);
      updateField("images", [response.upload.url]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: tagText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "edit" && initialProduct) {
        await updateProduct(initialProduct.id, payload, token);
      } else {
        await createProduct(payload, token);
      }

      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="entity-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>
              {mode === "create" ? "Add New Product" : mode === "edit" ? "Edit Product" : "Product Details"}
            </h2>
            <p>Add or update a product in your shop catalog.</p>
          </div>
          <button onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {error && <div className="content-message error">{error}</div>}

        <div className="modal-grid">
          <label className="field modal-full-field">
            <span>Product Name</span>
            <input
              disabled={isView}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g., Aspirin 500mg"
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select
              disabled={isView}
              onChange={(event) => updateField("categoryId", event.target.value)}
              value={form.categoryId}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Price ($)</span>
            <input
              disabled={isView}
              min="0"
              onChange={(event) => updateField("price", Number(event.target.value))}
              placeholder="9.99"
              step="0.01"
              type="number"
              value={form.price}
            />
          </label>

          <label className="field">
            <span>Stock Quantity</span>
            <input
              disabled={isView}
              min="0"
              onChange={(event) => updateField("stockQuantity", Number(event.target.value))}
              type="number"
              value={form.stockQuantity}
            />
          </label>

          <label className="field">
            <span>Tags</span>
            <input
              disabled={isView}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="medicine, pain relief"
              value={tagText}
            />
          </label>

          <label className="field modal-full-field">
            <span>Description</span>
            <textarea
              disabled={isView}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe your product..."
              value={form.description}
            />
          </label>

          <label className="field modal-full-field">
            <span>Product Image</span>
            <div className="image-upload-row">
              <div className="product-form-preview">
                {form.images[0] ? <img src={form.images[0]} alt="" /> : <ImagePlus size={28} />}
              </div>
              {!isView && (
                <input
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) => handleUpload(event.target.files?.[0])}
                  type="file"
                />
              )}
            </div>
          </label>

          <div className="modal-full-field form-toggle-grid">
            {[
              ["isAvailable", "Active"],
              ["isFeatured", "Featured"],
              ["showStock", "Show Stock"],
            ].map(([key, label]) => (
              <label className="inline-check" key={key}>
                <input
                  checked={Boolean(form[key as keyof ProductPayload])}
                  disabled={isView}
                  onChange={(event) =>
                    updateField(key as keyof ProductPayload, event.target.checked as never)
                  }
                  type="checkbox"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            {isView ? "Close" : "Cancel"}
          </button>
          {!isView && (
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : mode === "create" ? "Create Product" : "Save Product"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const Products = ({ records, onRefresh }: ProductsProps) => {
  const { token } = useAuth();
  const rows = records.map(toProductRow);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [activeProduct, setActiveProduct] = useState<ProductRow | undefined>();
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listCategories(token).then(setCategories).catch(() => setCategories([]));
  }, [token]);

  const filteredRows = useMemo(
    () =>
      rows.filter((product) =>
        `${product.name} ${product.categoryName}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const openView = async (product: ProductRow) => {
    if (!token) return;

    const response = await getProduct(product.id, token);
    setActiveProduct(toProductRow(response.product));
    setMode("view");
  };

  const openEdit = async (product: ProductRow) => {
    if (!token) return;

    const response = await getProduct(product.id, token);
    setActiveProduct(toProductRow(response.product));
    setMode("edit");
  };

  const handleDelete = async (product: ProductRow) => {
    if (!token || !window.confirm(`Delete product "${product.name}"?`)) return;

    await deleteProduct(product.id, token);
    onRefresh();
  };

  const columns: TableColumn<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <div className="product-admin-name">
          <ProductThumb product={product} />
          <strong>{product.name}</strong>
        </div>
      ),
    },
    { key: "categoryName", header: "Category" },
    {
      key: "price",
      header: "Price",
      render: (product) => <span className="table-strong">{formatCurrency(product.price)}</span>,
    },
    {
      key: "stockQuantity",
      header: "Stock",
      render: (product) =>
        product.stockQuantity <= 0 ? (
          <span className="stock-out">Out of stock</span>
        ) : (
          product.stockQuantity
        ),
    },
    {
      key: "isAvailable",
      header: "Status",
      render: (product) => (
        <span className={product.isAvailable ? "table-badge badge-green" : "table-badge badge-red"}>
          {product.isAvailable ? "Active" : "Out of Stock"}
        </span>
      ),
    },
  ];

  return (
    <section className="catalog-page">
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={20} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            value={query}
          />
        </label>
        <button className="secondary-action-button" type="button">
          <Filter size={18} />
          Filters
        </button>
        <button className="page-primary-action" onClick={() => setMode("create")} type="button">
          <Plus size={22} />
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        limit={filteredRows.length || 1}
        page={1}
        renderActions={(product, index) => (
          <div className={`row-action-menu ${index >= filteredRows.length - 2 ? "menu-up" : ""}`}>
            <button
              className="action-button"
              onClick={() => setOpenMenuId((current) => (current === product.id ? null : product.id))}
              type="button"
            >
              <MoreHorizontal size={22} />
            </button>
            {openMenuId === product.id && (
              <div className="row-action-popover">
                <button onClick={() => openView(product)} type="button">
                  <Eye size={17} /> View
                </button>
                <button onClick={() => openEdit(product)} type="button">
                  <Edit3 size={17} /> Edit
                </button>
                <button onClick={() => handleDelete(product)} type="button">
                  <Trash2 size={17} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
        rowKey="id"
        total={filteredRows.length}
      />

      <h2 className="catalog-subtitle">Grid View</h2>
      <div className="admin-product-grid">
        {filteredRows.map((product) => (
          <article className="admin-product-card" key={product.id}>
            <div className="admin-product-visual">
              <ProductThumb product={product} />
            </div>
            <div className="admin-product-body">
              <h3>{product.name}</h3>
              <p>{product.categoryName}</p>
              <div>
                <strong>{formatCurrency(product.price)}</strong>
                <span>{product.stockQuantity}</span>
              </div>
              <button onClick={() => openEdit(product)} type="button">
                <Edit3 size={17} />
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>

      {token && mode && (
        <ProductModal
          categories={categories}
          initialProduct={activeProduct}
          mode={mode}
          onClose={() => {
            setMode(null);
            setActiveProduct(undefined);
          }}
          onSaved={onRefresh}
          token={token}
        />
      )}
    </section>
  );
};

export default Products;
