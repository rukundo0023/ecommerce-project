import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  fetchAdminDashboard,
  type AdminDashboardData,
  type OrderStatus,
  updateOrderStatus,
} from "../lib/api";
import { formatRwf } from "../lib/currency";

const formatDay = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const STATUS_STEPS: OrderStatus[] = [
  "ordered",
  "confirmed",
  "shipped",
  "delivered",
];

const paymentLabel = {
  initiating: "Processing",
  pending: "Pending",
  successful: "Paid",
  failed: "Failed",
} as const;

const navItems = [
  { label: "Overview", target: "#overview", icon: "◫" },
  { label: "Products", target: "/admin/products", icon: "▦" },
  { label: "Categories", target: "#categories", icon: "◈" },
  { label: "Orders", target: "#orders", icon: "▤" },
  { label: "Inventory", target: "#inventory", icon: "▣" },
  { label: "Customers", target: "#customers", icon: "♙" },
  { label: "Payments", target: "#payments", icon: "＄" },
  { label: "Analytics", target: "#analytics", icon: "⌁" },
  { label: "Settings", target: "#settings", icon: "⚙" },
];

function SummaryCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const { auth } = useAuth();
  const token = auth?.token;
  const isAdmin = auth?.user.role === "admin";
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token || !isAdmin) return null;
    return fetchAdminDashboard(token);
  }, [isAdmin, token]);

  useEffect(() => {
    let active = true;
    loadDashboard()
      .then((result) => {
        if (active && result) setDashboard(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the admin dashboard."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const result = await loadDashboard();
      if (result) setDashboard(result);
      setError("");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to refresh the dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const advanceOrder = async (orderId: string, nextStatus: OrderStatus) => {
    if (!token) return;
    setUpdatingOrder(orderId);
    setError("");
    try {
      await updateOrderStatus(orderId, nextStatus, token);
      const result = await loadDashboard();
      if (result) setDashboard(result);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the order status."
      );
    } finally {
      setUpdatingOrder("");
    }
  };

  if (!auth) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Administrator dashboard</h1>
        <p className="mt-3 text-slate-600">
          <Link to="/login" className="font-semibold text-brand-800 underline">Sign in</Link>
          {" "}with an administrator account to manage the store.
        </p>
      </main>
    );
  }

  if (auth.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Administrator access required</h1>
        <p className="mt-3 text-slate-600">Your account is not permitted to manage the store.</p>
      </main>
    );
  }

  const maxDailyRevenue = Math.max(
    1,
    ...(dashboard?.salesByDay.map((day) => day.revenue) ?? [])
  );

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">
          <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Store workspace</p>
          <nav aria-label="Administrator sections" className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {navItems.map((item) => {
              const className = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-800";
              const contents = <><span className="w-5 text-center text-base" aria-hidden="true">{item.icon}</span>{item.label}</>;
              return item.target.startsWith("/") ? (
                <Link key={item.label} to={item.target} className={className}>{contents}</Link>
              ) : (
                <a key={item.label} href={item.target} className={className}>{contents}</a>
              );
            })}
          </nav>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">{auth.user.name}</p>
            <p className="mt-1 truncate text-[11px] text-slate-500">{auth.user.email}</p>
          </div>
        </aside>

        <div className="min-w-0">
          <section id="overview" className="scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Store overview</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Good day, {auth.user.name.split(" ")[0]}.</h1>
                <p className="mt-2 text-sm text-slate-600">Your store performance and operations at a glance.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/admin/products" className="rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">＋ Add product</Link>
                <a href="#orders" className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50">Manage orders</a>
                <a href="#analytics" className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50">View reports</a>
                <button type="button" onClick={() => void refreshDashboard()} disabled={loading || refreshing} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{refreshing ? "Refreshing…" : "Refresh"}</button>
              </div>
            </div>

            {dashboard && (
              <p className="mt-3 text-xs text-slate-500">
                Updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dashboard.generatedAt))}
              </p>
            )}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            {loading && !dashboard ? (
              <p className="mt-8 text-slate-600">Loading store data…</p>
            ) : dashboard ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label="Total sales" value={formatRwf(dashboard.revenue.total)} detail={`${formatRwf(dashboard.revenue.last7Days)} in the last 7 days`} accent="bg-brand-600" />
                  <SummaryCard label="Total orders" value={dashboard.orders.total.toLocaleString()} detail={`${dashboard.orders.awaitingDelivery} awaiting delivery`} accent="bg-sky-500" />
                  <SummaryCard label="Products" value={dashboard.inventory.totalProducts.toLocaleString()} detail={`${dashboard.inventory.unitsInStock.toLocaleString()} units in stock`} accent="bg-violet-500" />
                  <SummaryCard label="Low-stock items" value={dashboard.inventory.lowStock.toLocaleString()} detail={`${dashboard.inventory.outOfStock} currently out of stock`} accent="bg-orange-500" />
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                  <section id="analytics" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Sales performance</h2>
                        <p className="mt-1 text-sm text-slate-500">Paid revenue over the last seven days</p>
                      </div>
                      <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">RWF</span>
                    </div>
                    <div className="mt-6 grid h-52 grid-cols-7 items-end gap-3">
                      {dashboard.salesByDay.map((day) => (
                        <div key={day.date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2" title={`${formatDay(day.date)}: ${formatRwf(day.revenue)}`}>
                          <span className="truncate text-[10px] text-slate-500">{day.revenue ? formatRwf(day.revenue) : ""}</span>
                          <div className="flex h-full w-full items-end rounded-t-lg bg-slate-50">
                            <div className={`w-full rounded-t-lg ${day.revenue ? "bg-brand-600" : "bg-slate-100"}`} style={{ height: `${day.revenue ? Math.max(5, day.revenue / maxDailyRevenue * 100) : 3}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{formatDay(day.date)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Lifetime sales: {formatRwf(dashboard.revenue.total)}</p>
                  </section>

                  <section id="payments" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
                        <p className="mt-1 text-sm text-slate-500">Latest payment events</p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">{dashboard.payments.pending} pending</span>
                    </div>
                    <ul className="mt-4 divide-y divide-slate-100">
                      {dashboard.recentPayments.slice(0, 5).map((payment) => (
                        <li key={payment._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${payment.status === "successful" ? "bg-brand-50 text-brand-800" : payment.status === "failed" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-800"}`} aria-hidden="true">{payment.status === "successful" ? "✓" : payment.status === "failed" ? "!" : "…"}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{payment.user?.name ?? "Customer"}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">Checkout · {formatDate(payment.createdAt)}</span>
                          </span>
                          <span className="text-right">
                            <span className="block whitespace-nowrap text-sm font-semibold text-slate-900">{formatRwf(payment.amount)}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{paymentLabel[payment.status]}</span>
                          </span>
                        </li>
                      ))}
                      {dashboard.recentPayments.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No payment activity yet.</li>}
                    </ul>
                  </section>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <section id="categories" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
                        <p className="mt-1 text-sm text-slate-500">Products grouped by department</p>
                      </div>
                      <Link to="/admin/products" className="text-sm font-semibold text-brand-800 hover:underline">Manage products →</Link>
                    </div>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {dashboard.inventory.categories.map(({ category, count }) => (
                        <li key={category} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                          <span className="text-sm font-medium text-slate-700">{category}</span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section id="inventory" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Inventory attention</h2>
                        <p className="mt-1 text-sm text-slate-500">Products with five or fewer units</p>
                      </div>
                      <Link to="/admin/products" className="text-sm font-semibold text-brand-800 hover:underline">Manage →</Link>
                    </div>
                    <ul className="mt-4 divide-y divide-slate-100">
                      {dashboard.inventory.lowStockProducts.slice(0, 5).map((product) => (
                        <li key={product._id} className="flex items-center gap-3 py-3 first:pt-0">
                          {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-brand-700">✳</span>}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{product.name}</span>
                            <span className="block text-xs text-slate-500">{product.category}</span>
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.quantity === 0 ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-800"}`}>{product.quantity === 0 ? "Out of stock" : `${product.quantity} left`}</span>
                        </li>
                      ))}
                      {dashboard.inventory.lowStockProducts.length === 0 && <li className="py-6 text-center text-sm text-slate-500">Inventory levels look healthy.</li>}
                    </ul>
                  </section>
                </div>

                <section id="orders" className="mt-6 scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
                      <p className="mt-1 text-sm text-slate-500">Update fulfillment as orders are processed.</p>
                    </div>
                    <span className="text-xs text-slate-500">{dashboard.orders.total} total orders</span>
                  </div>
                  {dashboard.recentOrders.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Order</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Amount</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Payment</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Order status</th>
                            <th scope="col" className="px-5 py-3 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dashboard.recentOrders.map((order) => {
                            const currentIndex = STATUS_STEPS.indexOf(order.status);
                            const nextStatus = STATUS_STEPS[currentIndex + 1];
                            return (
                              <tr key={order._id}>
                                <th scope="row" className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 sm:px-6">#{order.orderNumber.slice(-8)}<span className="mt-1 block text-xs font-normal text-slate-500">{formatDate(order.createdAt)}</span></th>
                                <td className="px-5 py-4"><span className="block text-slate-800">{order.user?.name ?? "Customer"}</span><span className="mt-1 block max-w-44 truncate text-xs text-slate-500">{order.user?.email ?? ""}</span><span className="mt-1 block text-xs text-slate-500">{order.productName} × {order.quantity}</span></td>
                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{formatRwf(order.amount ?? order.totalPrice)}</td>
                                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.paymentStatus === "successful" ? "bg-brand-50 text-brand-800" : order.paymentStatus === "failed" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-800"}`}>{paymentLabel[order.paymentStatus ?? "successful"]}</span></td>
                                <td className="px-5 py-4"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold capitalize text-sky-800">{order.status}</span></td>
                                <td className="px-5 py-4">{nextStatus ? <button type="button" onClick={() => void advanceOrder(order._id, nextStatus)} disabled={updatingOrder === order._id} className="whitespace-nowrap rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50">{updatingOrder === order._id ? "Updating…" : `Mark ${nextStatus}`}</button> : <span className="text-xs font-medium text-brand-800">Complete</span>}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="px-5 py-10 text-center text-sm text-slate-500">Orders appear here after successful checkout.</p>}
                </section>

                <section id="customers" className="mt-6 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-semibold text-slate-900">Customers</h2>
                  <p className="mt-1 text-sm text-slate-500">{dashboard.customers.total.toLocaleString()} registered customer accounts. Customer management tools are not available yet.</p>
                </section>
                <section id="settings" className="mt-6 scroll-mt-28 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-slate-800">Store settings</h2>
                  <p className="mt-1 text-sm text-slate-600">Settings management is not available yet.</p>
                </section>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
