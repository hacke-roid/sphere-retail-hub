import {
  ChevronDown,
  Edit3,
  Eye,
  FolderOpen,
  ImagePlus,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategory,
  type CategoryPayload,
  type PageMetrics,
  type PageRecord,
  updateCategory,
  uploadImage,
} from "../../services/appDataService";
import { useAuth } from "../../context/AuthContext";

type CategoriesProps = {
  metrics: PageMetrics;
  records: PageRecord[];
  onRefresh: () => void;
};

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  parentId: string;
  isActive: boolean;
  productCount: number;
  subcategoryCount: number;
};

const iconOptions = ["💊", "🥗", "🩺", "🧴", "💉", "🩹", "🤧", "👕", "🍅", "🎧"];

const toText = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const toCategoryRow = (record: PageRecord): CategoryRow => ({
  id: toText(record.id || record._id),
  name: toText(record.name),
  description: toText(record.description),
  icon: toText(record.icon) || "💊",
  imageUrl: toText(record.imageUrl),
  parentId: toText(record.parentId),
  isActive: record.isActive !== false,
  productCount: Number(record.productCount) || 0,
  subcategoryCount: Number(record.subcategoryCount) || 0,
});

const CategoryVisual = ({ category }: { category: CategoryRow }) => (
  <span className="category-admin-icon">
    {category.imageUrl ? <img src={category.imageUrl} alt="" /> : category.icon}
  </span>
);

const CategoryModal = ({
  initialCategory,
  mode,
  onClose,
  onSaved,
  parentOptions,
  token,
}: {
  initialCategory?: CategoryRow;
  mode: "create" | "edit" | "view";
  onClose: () => void;
  onSaved: () => void;
  parentOptions: CategoryRow[];
  token: string;
}) => {
  const [form, setForm] = useState<CategoryPayload>({
    name: initialCategory?.name || "",
    description: initialCategory?.description || "",
    icon: initialCategory?.icon || iconOptions[0],
    imageUrl: initialCategory?.imageUrl || "",
    parentId: initialCategory?.parentId || "",
    isActive: initialCategory?.isActive ?? true,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isView = mode === "view";

  const updateField = <K extends keyof CategoryPayload>(field: K, value: CategoryPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      const response = await uploadImage(file, token);
      updateField("imageUrl", response.upload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        parentId: form.parentId || undefined,
      };

      if (mode === "edit" && initialCategory) {
        await updateCategory(initialCategory.id, payload, token);
      } else {
        await createCategory(payload, token);
      }

      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="entity-modal category-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>
              {mode === "create" ? "Create New Category" : mode === "edit" ? "Edit Category" : "Category Details"}
            </h2>
            <p>Add a product category to your shop.</p>
          </div>
          <button onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {error && <div className="content-message error">{error}</div>}

        <div className="modal-grid">
          <label className="field modal-full-field">
            <span>Category Name</span>
            <input
              disabled={isView}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g., Medications"
              required
              value={form.name}
            />
          </label>

          <label className="field modal-full-field">
            <span>Description</span>
            <textarea
              disabled={isView}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="e.g., Prescription and OTC medicines"
              value={form.description}
            />
          </label>

          <label className="field modal-full-field">
            <span>Parent Category</span>
            <select
              disabled={isView}
              onChange={(event) => updateField("parentId", event.target.value)}
              value={form.parentId}
            >
              <option value="">No parent category</option>
              {parentOptions
                .filter((category) => category.id !== initialCategory?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>

          <div className="field modal-full-field">
            <span>Category Icon</span>
            <div className="icon-picker-grid">
              {iconOptions.map((icon) => (
                <button
                  className={form.icon === icon ? "active" : ""}
                  disabled={isView}
                  key={icon}
                  onClick={() => updateField("icon", icon)}
                  type="button"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <label className="field modal-full-field">
            <span>Category Image</span>
            <div className="image-upload-row">
              <div className="product-form-preview">
                {form.imageUrl ? <img src={form.imageUrl} alt="" /> : <ImagePlus size={28} />}
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

          <label className="inline-check modal-full-field">
            <input
              checked={form.isActive}
              disabled={isView}
              onChange={(event) => updateField("isActive", event.target.checked)}
              type="checkbox"
            />
            <span>Active category</span>
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            {isView ? "Close" : "Cancel"}
          </button>
          {!isView && (
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : mode === "create" ? "Create Category" : "Save Category"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const Categories = ({ records, onRefresh }: CategoriesProps) => {
  const { token } = useAuth();
  const rows = records.map(toCategoryRow);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryRow | undefined>();
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const filteredRows = useMemo(
    () =>
      rows.filter((category) =>
        `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const openCategory = async (category: CategoryRow, nextMode: "view" | "edit") => {
    if (!token) return;

    const response = await getCategory(category.id, token);
    setActiveCategory(toCategoryRow(response.category));
    setMode(nextMode);
  };

  const handleDelete = async (category: CategoryRow) => {
    if (!token || !window.confirm(`Delete category "${category.name}"?`)) return;

    await deleteCategory(category.id, token);
    onRefresh();
  };

  return (
    <section className="catalog-page">
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={20} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories..."
            value={query}
          />
        </label>
        <button className="secondary-action-button" type="button">
          <SlidersHorizontal size={18} />
          Sort
        </button>
        <button className="page-primary-action" onClick={() => setMode("create")} type="button">
          <Plus size={22} />
          Add Category
        </button>
      </div>

      <div className="category-list">
        {filteredRows.map((category, index) => (
          <article className="category-admin-card" key={category.id}>
            <div className="category-card-top">
              <CategoryVisual category={category} />
              <div>
                <h2>{category.name}</h2>
                <p>{category.description || "No description added"}</p>
                <div className="category-meta">
                  <span>
                    <FolderOpen size={18} />
                    {category.productCount} products
                  </span>
                  {category.subcategoryCount > 0 && (
                    <span>
                      <ChevronDown size={18} />
                      {category.subcategoryCount} subcategories
                    </span>
                  )}
                </div>
              </div>
              <div className={`row-action-menu ${index >= filteredRows.length - 2 ? "menu-up" : ""}`}>
                <button
                  className="action-button"
                  onClick={() => setOpenMenuId((current) => (current === category.id ? null : category.id))}
                  type="button"
                >
                  <MoreHorizontal size={22} />
                </button>
                {openMenuId === category.id && (
                  <div className="row-action-popover">
                    <button onClick={() => openCategory(category, "view")} type="button">
                      <Eye size={17} /> View
                    </button>
                    <button onClick={() => openCategory(category, "edit")} type="button">
                      <Edit3 size={17} /> Edit
                    </button>
                    <button onClick={() => handleDelete(category)} type="button">
                      <Trash2 size={17} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {category.subcategoryCount > 0 && (
              <button className="show-subcategories" type="button">
                <ChevronDown size={18} />
                Show Subcategories
              </button>
            )}
          </article>
        ))}
      </div>

      {token && mode && (
        <CategoryModal
          initialCategory={activeCategory}
          mode={mode}
          onClose={() => {
            setActiveCategory(undefined);
            setMode(null);
          }}
          onSaved={onRefresh}
          parentOptions={rows}
          token={token}
        />
      )}
    </section>
  );
};

export default Categories;
