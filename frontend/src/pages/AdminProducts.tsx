import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import { useToast } from "../context/useToast";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  PRODUCT_CATEGORIES,
  updateProduct,
  type Product,
} from "../lib/api";
import { formatRwf } from "../lib/currency";
import { queryKeys } from "../lib/queryClient";

interface ProductForm {
  name: string;
  category: (typeof PRODUCT_CATEGORIES)[number];
  price: string;
  description: string;
  quantity: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  category: "Electronics",
  price: "",
  description: "",
  quantity: "",
};

const fetchAllProducts = async (token: string): Promise<Product[]> => {
  const firstPage = await fetchProducts(token, 1, 100);
  const products = [...firstPage.products];
  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchProducts(token, page, 100);
    products.push(...nextPage.products);
  }
  return products;
};

export default function AdminProducts() {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const token = auth?.token;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ProductForm>({
    defaultValues: EMPTY_FORM,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const productsQuery = useQuery({
    queryKey: queryKeys.adminProducts(auth?.user.id ?? ""),
    queryFn: () => {
      if (!token) throw new Error("Sign in with an administrator account.");
      return fetchAllProducts(token);
    },
    enabled: Boolean(token && auth?.user.role === "admin"),
  });
  const products = productsQuery.data ?? [];
  const loading = productsQuery.isPending;
  const loadError = productsQuery.error instanceof Error
    ? productsQuery.error.message
    : "";
  const invalidateProductData = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminProducts(auth?.user.id ?? ""),
      }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminDashboard(auth?.user.id ?? ""),
      }),
    ]);
  const saveMutation = useMutation({
    mutationFn: ({
      productId,
      data,
      accessToken,
    }: {
      productId: string | null;
      data: FormData;
      accessToken: string;
    }) =>
      productId
        ? updateProduct(productId, data, accessToken)
        : createProduct(data, accessToken),
    onSuccess: invalidateProductData,
  });
  const deleteMutation = useMutation({
    mutationFn: ({ productId, accessToken }: { productId: string; accessToken: string }) =>
      deleteProduct(productId, accessToken),
    onSuccess: invalidateProductData,
  });
  const saving = saveMutation.isPending;
  const deletingId = deleteMutation.isPending
    ? deleteMutation.variables?.productId ?? ""
    : "";

  const startEditing = (product: Product) => {
    setEditing(product);
    reset({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      quantity: String(product.quantity),
    });
    setImage(null);
    setError("");
    setNotice("");
  };

  const resetForm = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setImage(null);
  };

  const saveProduct = async (values: ProductForm) => {
    if (!auth) return;

    setError("");
    setNotice("");
    if (image && !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      const message = "Choose a JPEG, PNG, or WebP image.";
      setError(message);
      showToast(message, "error");
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      const message = "Product images must be 5 MB or smaller.";
      setError(message);
      showToast(message, "error");
      return;
    }
    const data = new FormData();
    data.set("name", values.name.trim());
    data.set("category", values.category);
    data.set("price", values.price);
    data.set("description", values.description.trim());
    data.set("quantity", values.quantity);
    if (image) data.set("image", image);

    try {
      await saveMutation.mutateAsync({
        productId: editing?._id ?? null,
        data,
        accessToken: auth.token,
      });
      const message = editing
        ? "Product updated successfully."
        : "Product added successfully.";
      setNotice(message);
      showToast(message, "success");
      resetForm();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this product.";
      setError(message);
      showToast(message, "error");
      return;
    }
  };

  const removeProduct = async (product: Product) => {
    if (!auth || !window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await deleteMutation.mutateAsync({
        productId: product._id,
        accessToken: auth.token,
      });
      if (editing?._id === product._id) resetForm();
      setNotice("Product deleted.");
      showToast("Product deleted.", "success");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this product.";
      setError(message);
      showToast(message, "error");
    }
  };

  if (!auth) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Product management</h1>
        <p className="mt-3 text-stone-600">
          <Link to="/login" className="font-semibold text-brand-800 underline">
            Sign in
          </Link>{" "}
          with an administrator account to manage products.
        </p>
      </main>
    );
  }

  if (auth.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Administrator access required</h1>
        <p className="mt-3 text-stone-600">
          Your account is not permitted to manage products.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
            Store administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Product management
          </h1>
          <p className="mt-2 text-stone-600">
            Add products, keep stock details current, and update your storefront.
          </p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-brand-800 hover:underline">
          View storefront →
        </Link>
      </div>

      {(error || loadError) && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error || loadError}</p>}
      {notice && <p role="status" className="mt-6 rounded-lg bg-brand-50 p-4 text-brand-800">{notice}</p>}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-semibold text-slate-900">
          {editing ? "Edit product" : "Add a product"}
        </h2>
        <form noValidate onSubmit={handleSubmit(saveProduct)} className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Product name
            <input
              aria-invalid={Boolean(formErrors.name)}
              aria-describedby={formErrors.name ? "product-name-error" : undefined}
              {...register("name", {
                required: "Enter a product name using 1 to 120 non-space characters.",
                maxLength: {
                  value: 120,
                  message: "Enter a product name using 1 to 120 non-space characters.",
                },
                validate: (value) =>
                  Boolean(value.trim()) ||
                  "Enter a product name that includes at least one non-space character.",
              })}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
            />
            {formErrors.name && <span id="product-name-error" role="alert" className="mt-1 block text-sm text-red-700">{formErrors.name.message}</span>}
          </label>
          <label className="text-sm font-medium">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              max="9007199254740991"
              inputMode="decimal"
              aria-invalid={Boolean(formErrors.price)}
              aria-describedby={formErrors.price ? "product-price-error" : undefined}
              {...register("price", {
                required: "Enter a valid price greater than or equal to zero.",
                validate: (value) => {
                  const price = Number(value);
                  const valid =
                    Number.isFinite(price) &&
                    price >= 0 &&
                    price <= Number.MAX_SAFE_INTEGER &&
                    Math.abs(price * 100 - Math.round(price * 100)) < 1e-8;
                  return valid || "Enter a valid price with up to two decimal places.";
                },
              })}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
            />
            {formErrors.price && <span id="product-price-error" role="alert" className="mt-1 block text-sm text-red-700">{formErrors.price.message}</span>}
          </label>
          <label className="text-sm font-medium">
            Category
            <select
              aria-invalid={Boolean(formErrors.category)}
              aria-describedby={formErrors.category ? "product-category-error" : undefined}
              {...register("category", { required: "Choose a product category." })}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {formErrors.category && <span id="product-category-error" role="alert" className="mt-1 block text-sm text-red-700">{formErrors.category.message}</span>}
          </label>
          <label className="text-sm font-medium">
            Quantity in stock
            <input
              type="number"
              min="0"
              max="9007199254740991"
              step="1"
              inputMode="numeric"
              aria-invalid={Boolean(formErrors.quantity)}
              aria-describedby={formErrors.quantity ? "product-quantity-error" : undefined}
              {...register("quantity", {
                required: "Stock quantity must be a whole number of zero or more.",
                validate: (value) =>
                  (Number.isSafeInteger(Number(value)) && Number(value) >= 0) ||
                  "Stock quantity must be a whole number of zero or more.",
              })}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
            />
            {formErrors.quantity && <span id="product-quantity-error" role="alert" className="mt-1 block text-sm text-red-700">{formErrors.quantity.message}</span>}
          </label>
          <label className="text-sm font-medium">
            Product image (JPEG, PNG, or WebP; max 5 MB)
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Description
            <textarea
              rows={4}
              aria-invalid={Boolean(formErrors.description)}
              aria-describedby={formErrors.description ? "product-description-error" : undefined}
              {...register("description", {
                required: "Enter a description using 1 to 2,000 non-space characters.",
                maxLength: {
                  value: 2000,
                  message: "Enter a description using 1 to 2,000 non-space characters.",
                },
                validate: (value) =>
                  Boolean(value.trim()) ||
                  "Enter a description that includes at least one non-space character.",
              })}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
            />
            {formErrors.description && <span id="product-description-error" role="alert" className="mt-1 block text-sm text-red-700">{formErrors.description.message}</span>}
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Add product"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-stone-300 px-6 py-3 font-semibold text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
          {!loading && <span className="text-sm text-stone-500">{products.length} listed</span>}
        </div>
        {loading ? (
          <p className="mt-5 text-stone-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-600">
            No products yet. Add your first product using the form above.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th scope="col" className="px-5 py-4">Product</th>
                  <th scope="col" className="px-5 py-4">Category</th>
                  <th scope="col" className="px-5 py-4">Price</th>
                  <th scope="col" className="px-5 py-4">Stock</th>
                  <th scope="col" className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <th scope="row" className="px-5 py-4 font-medium text-stone-900">
                      <span className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500" aria-label="No image">—</span>
                        )}
                        <span>
                          {product.name}
                          <span className="mt-1 block max-w-xs truncate font-normal text-stone-500">
                            {product.description}
                          </span>
                        </span>
                      </span>
                    </th>
                    <td className="px-5 py-4">{product.category}</td>
                    <td className="px-5 py-4">{formatRwf(product.price)}</td>
                    <td className="px-5 py-4">{product.quantity}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="font-semibold text-brand-800 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeProduct(product)}
                          disabled={deletingId === product._id}
                          className="font-semibold text-red-700 hover:underline disabled:opacity-60"
                        >
                          {deletingId === product._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
