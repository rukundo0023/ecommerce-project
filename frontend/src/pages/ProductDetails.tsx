import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/auth";
import { fetchProduct, type Product } from "../lib/api";
import { readCart, writeCart } from "../lib/cart";

export default function ProductDetails() {
  const { id } = useParams();
  const { auth } = useAuth();
  const [loaded, setLoaded] = useState<{
    id: string;
    token: string | null;
    product: Product | null;
    error: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    if (!id) return () => {
      active = false;
    };
    fetchProduct(id, auth?.token)
      .then(({ product: result }) => {
        if (active) {
          setLoaded({ id, token: auth?.token ?? null, product: result, error: "" });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setLoaded({
            id,
            token: auth?.token ?? null,
            product: null,
            error: requestError instanceof Error
              ? requestError.message
              : "Unable to load this product.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [auth, id]);

  const result =
    id && loaded?.id === id && loaded.token === (auth?.token ?? null)
      ? loaded
      : null;
  const product = result?.product ?? null;
  const error = result?.error ?? actionError;
  const loading = Boolean(id && !result);

  const addToCart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const items = readCart();
    const existing = items.find((item) => item.productId === product._id);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > product.quantity) {
      setActionError(`Only ${product.quantity} item(s) are currently in stock.`);
      return;
    }

    setActionError("");
    setNotice(`${product.name} added to your cart.`);
    writeCart(
      existing
        ? items.map((item) =>
            item.productId === product._id
              ? {
                  ...item,
                  quantity: nextQuantity,
                  availableQuantity: product.quantity,
                }
              : item
          )
        : [
            ...items,
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity,
              availableQuantity: product.quantity,
            },
          ]
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <Link to="/products" className="text-sm font-medium text-emerald-800 hover:underline">← Back to collection</Link>
      {loading && <p className="mt-8 text-stone-600">Loading product...</p>}
      {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 p-5 text-red-800">{error}</p>}
      {product && (
        <div className="mt-6 grid gap-8 overflow-hidden rounded-[2rem] border border-[#e8e4da] bg-[#fffdf8] p-5 shadow-sm sm:p-8 md:grid-cols-2 md:gap-12">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-80 w-full rounded-[1.5rem] bg-[#f0ede4] object-cover sm:h-[28rem]" />
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-[1.5rem] bg-[radial-gradient(circle_at_30%_20%,#e6e8dc,transparent_55%),linear-gradient(135deg,#f0ede4,#e8dfd0)] text-[#6f846c]"><span className="text-6xl">✳</span></div>
          )}
          <section className="flex flex-col justify-center py-2 md:py-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a36d4b]">A ShopEase find</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#28382e] sm:text-4xl">{product.name}</h1>
            <p className="mt-5 inline-flex w-fit rounded-full bg-[#e9eee5] px-4 py-2 text-xl font-semibold text-emerald-900">{product.price.toFixed(2)}</p>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-[#65675e]">{product.description}</p>
            <p className="mt-5 text-sm text-stone-600">
              {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
            </p>
            {product.quantity > 0 && (
              <form onSubmit={addToCart} className="mt-6 flex flex-wrap items-end gap-3">
                <label className="text-sm font-medium">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    max={product.quantity}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                    className="mt-1 block w-24 rounded-xl border border-[#d8d8cc] bg-[#fffdf8] px-3 py-2"
                    required
                  />
                </label>
                <button type="submit" className="rounded-full bg-emerald-800 px-6 py-3 font-semibold text-white transition hover:bg-emerald-900">
                  Add to cart <span aria-hidden="true">→</span>
                </button>
              </form>
            )}
            {notice && <p role="status" className="mt-4 text-green-700">{notice} <Link to="/cart" className="font-semibold underline">View cart</Link></p>}
          </section>
        </div>
      )}
    </main>
  );
}
