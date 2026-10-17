import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  fetchMomoPaymentStatus,
  fetchMyOrders,
  fetchMyPayments,
  fetchProducts,
  type CustomerPayment,
  type OrderStatus,
  type Product,
  type ProductPagination,
  type StoreOrder,
} from "../lib/api";
import { readCart, writeCart } from "../lib/cart";
import { formatRwf } from "../lib/currency";

const WISHLIST_EVENT = "wishlist-updated";
const ORDER_STEPS: OrderStatus[] = [
  "ordered",
  "confirmed",
  "shipped",
  "delivered",
];
const statusLabel: Record<OrderStatus, string> = {
  ordered: "Ordered",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

const wishlistKey = (userId: string) => `rukundoe-wishlist-${userId}`;
const profileKey = (userId: string) => `rukundoe-profile-${userId}`;

const readWishlist = (userId: string): string[] => {
  const value: unknown = JSON.parse(localStorage.getItem(wishlistKey(userId)) ?? "[]");
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const readSavedAccount = (userId: string) => {
  try {
    return {
      wishlist: userId ? readWishlist(userId) : [],
      address: userId
        ? localStorage.getItem(profileKey(userId)) ?? ""
        : "",
      error: "",
    };
  } catch {
    return {
      wishlist: [],
      address: "",
      error: "Your browser could not load saved wishlist or address details.",
    };
  }
};

const formatOrderDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(date)
  );

function OrderProgress({ status }: { status: OrderStatus }) {
  const currentStep = ORDER_STEPS.indexOf(status);
  return (
    <ol
      aria-label={`Order tracking: ${statusLabel[status]}`}
      className="grid grid-cols-4 gap-2"
    >
      {ORDER_STEPS.map((step, index) => (
        <li key={step} className="min-w-0 text-center">
          <span
            className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
              index <= currentStep
                ? "bg-brand-700 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {index < currentStep ? "✓" : index + 1}
          </span>
          <span
            className={`mt-2 block truncate text-[10px] font-semibold sm:text-xs ${
              index <= currentStep ? "text-brand-800" : "text-slate-400"
            }`}
          >
            {statusLabel[step]}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function CustomerDashboard() {
  const { auth } = useAuth();
  const userId = auth?.user.id ?? "";
  const [savedAccount] = useState(() => readSavedAccount(userId));
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [pagination, setPagination] = useState<ProductPagination | null>(null);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(savedAccount.wishlist);
  const [address, setAddress] = useState(savedAccount.address);
  const [addressDraft, setAddressDraft] = useState(savedAccount.address);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(savedAccount.error);
  const [notice, setNotice] = useState("");
  const [checkingPayment, setCheckingPayment] = useState("");

  useEffect(() => {
    if (!auth || auth.user.role !== "user") return;
    let active = true;
    Promise.all([
      fetchMyOrders(auth.token, page, 10),
      fetchProducts(auth.token, 1, 4, "", "Electronics"),
      fetchMyPayments(auth.token, 1, 5),
    ])
      .then(([orderResult, productResult, paymentResult]) => {
        if (!active) return;
        setOrders(orderResult.orders);
        setPagination(orderResult.pagination);
        setProducts(productResult.products);
        setPayments(paymentResult.payments);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load your account dashboard."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth, page]);

  useEffect(() => {
    if (!userId) return;
    const syncWishlist = () => {
      try {
        setWishlist(readWishlist(userId));
      } catch {
        setError("Your browser could not load saved wishlist details.");
      }
    };
    window.addEventListener(WISHLIST_EVENT, syncWishlist);
    return () => window.removeEventListener(WISHLIST_EVENT, syncWishlist);
  }, [userId]);

  const toggleWishlist = (productId: string) => {
    if (!userId) return;
    const next = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    try {
      localStorage.setItem(wishlistKey(userId), JSON.stringify(next));
      setWishlist(next);
      window.dispatchEvent(new Event(WISHLIST_EVENT));
    } catch {
      setError("Unable to save your wishlist in this browser.");
    }
  };

  const addToCart = (product: Product) => {
    const cart = readCart();
    const existing = cart.find((item) => item.productId === product._id);
    if (existing && existing.quantity >= product.quantity) {
      setError(`Only ${product.quantity} ${product.name} item(s) are in stock.`);
      return;
    }
    writeCart(
      existing
        ? cart.map((item) =>
            item.productId === product._id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  availableQuantity: product.quantity,
                }
              : item
          )
        : [
            ...cart,
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: 1,
              availableQuantity: product.quantity,
            },
          ]
    );
    setNotice(`${product.name} added to your cart.`);
    setError("");
  };

  const checkPayment = async (payment: CustomerPayment) => {
    if (!auth) return;
    setCheckingPayment(payment.reference);
    setError("");
    try {
      const result = await fetchMomoPaymentStatus(payment.reference, auth.token);
      setPayments((current) =>
        current.map((item) =>
          item.reference === result.reference
            ? { ...item, status: result.status }
            : item
        )
      );
      if (result.status === "successful") {
        const orderResult = await fetchMyOrders(auth.token, page, 10);
        setOrders(orderResult.orders);
        setPagination(orderResult.pagination);
      }
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to check this payment status."
      );
    } finally {
      setCheckingPayment("");
    }
  };

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;
    try {
      localStorage.setItem(profileKey(userId), addressDraft.trim());
      setAddress(addressDraft.trim());
      setNotice("Your address was saved in this browser.");
    } catch {
      setError("Unable to save your address in this browser.");
    }
  };

  if (auth?.user.role === "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Customer dashboard</h1>
        <p className="mt-3 text-slate-600">
          Review store activity from the{" "}
          <Link to="/admin" className="font-semibold text-brand-800 underline">
            admin dashboard
          </Link>
          .
        </p>
      </main>
    );
  }

  const latestOrder = orders[0];
  const awaitingDelivery = orders.filter(
    (order) => order.status !== "delivered"
  ).length;
  const latestProduct = latestOrder
    ? products.find((product) => product.name === latestOrder.productName)
    : undefined;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
      <nav
        aria-label="Customer dashboard navigation"
        className="mb-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 text-sm"
      >
        <a href="#welcome" className="whitespace-nowrap rounded-full bg-brand-50 px-4 py-2 font-semibold text-brand-800">Dashboard</a>
        <Link to="/products" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">Shop</Link>
        <a href="#orders" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">My Orders</a>
        <a href="#wishlist" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">Wishlist</a>
        <a href="#profile" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">My Profile</a>
        <a href="#addresses" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">Addresses</a>
        <Link to="/contact" className="whitespace-nowrap rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">Support</Link>
      </nav>

      <section id="welcome" className="scroll-mt-28">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Your account</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {auth?.user.name.split(" ")[0] ?? "there"}.
            </h1>
            <p className="mt-2 text-slate-600">
              Your order updates, saved finds, and account details are all here.
            </p>
          </div>
          <Link to="/products" className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">
            Continue shopping
          </Link>
        </div>
      </section>

      {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-6 rounded-lg bg-brand-50 p-4 text-brand-800">{notice}</p>}

      <section aria-label="Account summary" className="mt-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total orders", value: pagination?.total ?? orders.length, detail: "All your purchases" },
          { label: "Wishlist items", value: wishlist.length, detail: "Saved in this browser" },
          { label: "Awaiting delivery", value: awaitingDelivery, detail: "Not yet delivered" },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section id="orders" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent order</h2>
              <p className="mt-1 text-sm text-slate-500">Track each confirmed purchase through delivery.</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-brand-800 hover:underline">Shop more →</Link>
          </div>
          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading orders...</p>
          ) : latestOrder ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-4">
                {latestOrder.imageUrl || latestProduct?.imageUrl ? (
                  <img
                    src={latestOrder.imageUrl ?? latestProduct?.imageUrl}
                    alt={latestOrder.productName}
                    className="h-20 w-20 rounded-xl bg-slate-100 object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-xl bg-brand-50 text-3xl text-brand-700" aria-hidden="true">✳</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {latestOrder.items?.map((item) => `${item.productName} × ${item.quantity}`).join(", ") ?? `${latestOrder.productName} × ${latestOrder.quantity}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Order #{latestOrder.orderNumber.slice(-8)} · {formatOrderDate(latestOrder.createdAt)}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-800">
                    {latestOrder.paymentStatus === "successful" ? "Payment accepted" : `Payment ${latestOrder.paymentStatus ?? "confirmed"}`}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">{formatRwf(latestOrder.totalPrice)}</p>
              </div>
              <div className="mt-6">
                <OrderProgress status={latestOrder.status} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-semibold text-slate-800">No orders yet</p>
              <p className="mt-1 text-sm text-slate-500">Your confirmed purchases will appear here.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Account summary</h2>
          <p className="mt-1 text-sm text-slate-500">Your profile and delivery details.</p>
          <div id="profile" className="mt-5 scroll-mt-28 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile</p>
            <p className="mt-2 font-semibold text-slate-900">{auth?.user.name}</p>
            <p className="mt-1 text-sm text-slate-600">{auth?.user.email}</p>
          </div>
          <form id="addresses" onSubmit={saveAddress} className="mt-5 scroll-mt-28 border-t border-slate-100 pt-4">
            <label htmlFor="customer-address" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery address</label>
            <textarea
              id="customer-address"
              rows={2}
              maxLength={300}
              value={addressDraft}
              onChange={(event) => setAddressDraft(event.target.value)}
              placeholder="Save an address for your next order"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">{address ? "Saved in this browser" : "No saved address"}</span>
              <button type="submit" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-50">Save address</button>
            </div>
          </form>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Order history</h2>
            <p className="mt-1 text-sm text-slate-500">Your items and current fulfillment status.</p>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={!pagination.hasPreviousPage}
                className="font-semibold text-brand-800 disabled:opacity-40"
              >Previous</button>
              <span>{pagination.page}/{pagination.totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination.hasNextPage}
                className="font-semibold text-brand-800 disabled:opacity-40"
              >Next</button>
            </div>
          )}
        </div>
        {orders.length ? (
          <ul className="mt-5 divide-y divide-slate-100">
            {orders.map((order) => (
              <li key={order._id} className="grid gap-4 py-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center">
                <div className="flex items-center gap-3">
                  {order.imageUrl ? <img src={order.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-brand-700">✳</span>}
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.items?.map((item) => `${item.productName} × ${item.quantity}`).join(", ") ?? `${order.productName} × ${order.quantity}`}
                    </p>
                    <p className="text-xs text-slate-500">#{order.orderNumber.slice(-8)} · {formatOrderDate(order.createdAt)}</p>
                    <p className="mt-1 text-xs font-medium text-brand-800">
                      Payment {order.paymentStatus === "successful" ? "accepted" : order.paymentStatus ?? "confirmed"}
                    </p>
                  </div>
                </div>
                <OrderProgress status={order.status} />
                <p className="font-semibold text-slate-900">{formatRwf(order.totalPrice)}</p>
              </li>
            ))}
          </ul>
        ) : !loading ? (
          <p className="mt-5 text-sm text-slate-500">No orders to show yet.</p>
        ) : null}
      </section>

      {payments.some((payment) => payment.status === "pending" || payment.status === "initiating") && (
        <section className="mt-8 rounded-2xl border border-orange-200 bg-orange-50/60 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Payments awaiting confirmation</h2>
          <p className="mt-1 text-sm text-slate-600">Approve the MTN MoMo prompt or check the latest status.</p>
          <ul className="mt-4 divide-y divide-orange-100">
            {payments
              .filter((payment) => payment.status === "pending" || payment.status === "initiating")
              .map((payment) => (
                <li key={payment._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Checkout #{payment.reference.slice(-8)}</span>
                    <span className="mt-1 block text-xs text-slate-600">{formatRwf(payment.amount)} · {payment.status === "initiating" ? "Processing" : "Pending"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void checkPayment(payment)}
                    disabled={checkingPayment === payment.reference}
                    className="rounded-full border border-orange-300 px-4 py-2 text-xs font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
                  >
                    {checkingPayment === payment.reference ? "Checking…" : "Check payment"}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section id="wishlist" className="mt-8 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your wishlist</h2>
            <p className="mt-1 text-sm text-slate-500">Saved on this device and browser.</p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">{wishlist.length} saved</span>
        </div>
        {wishlist.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {wishlist.map((id) => {
              const product = products.find((item) => item._id === id);
              return (
                <li key={id} className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm">
                  {product ? <Link to={`/products/${id}`} className="font-medium hover:text-brand-800">{product.name}</Link> : <span className="text-slate-600">Saved product</span>}
                  <button type="button" aria-label="Remove saved product" onClick={() => toggleWishlist(id)} className="font-bold text-rose-700">×</button>
                </li>
              );
            })}
          </ul>
        ) : <p className="mt-4 text-sm text-slate-500">Save products you like from the recommendations below.</p>}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-700">Picked for you</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Recommended electronics</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-brand-800 hover:underline">Browse all →</Link>
        </div>
        {products.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Link to={`/products/${product._id}`} className="block">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-44 w-full bg-slate-100 object-cover" /> : <div className="grid h-44 place-items-center bg-gradient-to-br from-brand-50 to-slate-100 text-5xl text-brand-700">✳</div>}
                </Link>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">{product.category}</p>
                  <Link to={`/products/${product._id}`} className="mt-1 block truncate font-semibold text-slate-900 hover:text-brand-800">{product.name}</Link>
                  <p className="mt-2 font-bold text-brand-900">{formatRwf(product.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={() => addToCart(product)} disabled={product.quantity < 1} className="flex-1 rounded-full bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">Add to cart</button>
                    <button
                      type="button"
                      aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={wishlist.includes(product._id)}
                      onClick={() => toggleWishlist(product._id)}
                      className={`grid h-9 w-9 place-items-center rounded-full border text-lg ${wishlist.includes(product._id) ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:text-rose-700"}`}
                    >♥</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Recommended products will appear here when the catalogue is available.</p>}
      </section>
    </main>
  );
}
