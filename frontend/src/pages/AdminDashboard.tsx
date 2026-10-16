import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  fetchAdminDashboard,
  type AdminDashboardData,
} from "../lib/api";
import { formatRwf } from "../lib/currency";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatDay = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

const MetricCard = ({
  label,
  value,
  detail,
  tone = "brand",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "brand" | "orange" | "blue" | "red";
}) => {
  const tones = {
    brand: "bg-brand-50 text-brand-800",
    orange: "bg-orange-50 text-orange-800",
    blue: "bg-sky-50 text-sky-800",
    red: "bg-red-50 text-red-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
      <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
        {detail}
      </p>
    </article>
  );
};

export default function AdminDashboard() {
  const { auth } = useAuth();
  const token = auth?.token;
  const isAdmin = auth?.user.role === "admin";
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token || !isAdmin) return null;
    return fetchAdminDashboard(token);
  }, [isAdmin, token]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await loadDashboard();
        if (active && result) {
          setDashboard(result);
          setError("");
        }
      } catch (requestError: unknown) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the admin dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const result = await loadDashboard();
      if (result) {
        setDashboard(result);
        setError("");
      }
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the admin dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (!auth) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Administrator dashboard</h1>
        <p className="mt-3 text-slate-600">
          <Link to="/login" className="font-semibold text-brand-800 underline">
            Sign in
          </Link>{" "}
          with an administrator account to view store insights.
        </p>
      </main>
    );
  }

  if (auth.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-semibold">Administrator access required</h1>
        <p className="mt-3 text-slate-600">
          Your account is not permitted to view store insights.
        </p>
      </main>
    );
  }

  const maxDailyRevenue = Math.max(
    1,
    ...(dashboard?.salesByDay.map((day) => day.revenue) ?? [])
  );
  const revenueChange =
    dashboard && dashboard.revenue.previous7Days > 0
      ? ((dashboard.revenue.last7Days - dashboard.revenue.previous7Days) /
          dashboard.revenue.previous7Days) *
        100
      : null;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
            Store overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Admin dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Track paid sales, payment activity, and stock health in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:border-brand-700 hover:bg-brand-50"
          >
            Manage products
          </Link>
          <button
            type="button"
            onClick={() => void refreshDashboard()}
            disabled={loading || refreshing}
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </div>

      {dashboard && (
        <p className="mt-5 text-xs text-slate-500">
          Updated {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(dashboard.generatedAt))}
        </p>
      )}

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && !dashboard ? (
        <p className="mt-8 text-slate-600">Loading live store data...</p>
      ) : dashboard ? (
        <>
          <section aria-label="Store metrics" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Lifetime revenue"
              value={formatRwf(dashboard.revenue.total)}
              detail={`${formatRwf(dashboard.revenue.last7Days)} in the last 7 days`}
            />
            <MetricCard
              label="Successful checkouts"
              value={dashboard.payments.successful.toLocaleString()}
              detail={`${dashboard.salesByDay.reduce((total, day) => total + day.checkouts, 0)} in the last 7 days`}
              tone="blue"
            />
            <MetricCard
              label="Products in catalogue"
              value={dashboard.inventory.totalProducts.toLocaleString()}
              detail={`${dashboard.inventory.unitsInStock.toLocaleString()} units available`}
              tone="orange"
            />
            <MetricCard
              label="Payments to review"
              value={dashboard.payments.pending.toLocaleString()}
              detail={`${dashboard.payments.failed} failed payments`}
              tone={dashboard.payments.pending > 0 ? "red" : "brand"}
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sales activity</h2>
                  <p className="mt-1 text-sm text-slate-500">Successful payment revenue by day · RWF</p>
                </div>
                <p className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">
                  Last 7 days
                </p>
              </div>
              <div
                aria-label="Daily revenue for the last seven days"
                className="mt-8 grid h-48 grid-cols-7 items-end gap-2 sm:gap-4"
              >
                {dashboard.salesByDay.map((day) => {
                  const barHeight =
                    day.revenue > 0
                      ? Math.max(6, (day.revenue / maxDailyRevenue) * 100)
                      : 0;
                  return (
                    <div
                      key={day.date}
                      className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                      title={`${formatDay(day.date)}: ${formatRwf(day.revenue)} · ${day.checkouts} checkouts`}
                    >
                      <div className="flex h-full w-full items-end">
                        <div
                          className={`w-full rounded-t-lg ${day.revenue > 0 ? "bg-brand-600" : "bg-slate-100"}`}
                          style={{ height: `${day.revenue > 0 ? barHeight : 4}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                        {formatDay(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-xs text-slate-500">
                {revenueChange === null
                  ? dashboard.revenue.previous7Days === 0
                    ? "No revenue recorded in the previous 7-day period for comparison."
                    : "Revenue comparison is not available."
                  : `${Math.abs(revenueChange).toFixed(1)}% ${revenueChange >= 0 ? "up" : "down"} from the previous 7 days.`}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Inventory health</h2>
              <p className="mt-1 text-sm text-slate-500">Stock levels across the catalogue</p>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">In stock</span>
                    <span className="font-semibold text-slate-900">{dashboard.inventory.totalProducts - dashboard.inventory.outOfStock} products</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{
                        width: `${dashboard.inventory.totalProducts
                          ? ((dashboard.inventory.totalProducts - dashboard.inventory.outOfStock) /
                              dashboard.inventory.totalProducts) *
                            100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-4 py-3">
                  <span className="text-sm text-orange-900">Low stock (5 or fewer)</span>
                  <span className="font-semibold text-orange-900">{dashboard.inventory.lowStock}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3">
                  <span className="text-sm text-red-900">Out of stock</span>
                  <span className="font-semibold text-red-900">{dashboard.inventory.outOfStock}</span>
                </div>
              </div>
              <Link
                to="/admin/products"
                className="mt-5 inline-flex text-sm font-semibold text-brand-800 hover:underline"
              >
                Update inventory <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Best sellers</h2>
              <p className="mt-1 text-sm text-slate-500">Products ranked by paid units sold</p>
            </div>
            {dashboard.bestSellers.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">Sales will appear here after the first completed order.</p>
            ) : (
              <ol className="mt-5 divide-y divide-slate-100">
                {dashboard.bestSellers.map((product, index) => (
                  <li key={product.productName} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-800">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                      {product.productName}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold text-slate-900">{product.unitsSold} sold</span>
                      <span className="mt-1 block text-xs text-slate-500">{formatRwf(product.revenue)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent checkouts</h2>
                <p className="mt-1 text-sm text-slate-500">Latest successful and pending payments</p>
              </div>
              <span className="text-xs text-slate-500">Showing {dashboard.recentPayments.length}</span>
            </div>
            {dashboard.recentPayments.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No checkout activity yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Checkout</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Items</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Amount</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboard.recentPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                          <span className="block font-semibold text-slate-900">
                            {payment.reference.slice(-8)}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {formatDate(payment.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="block text-slate-800">{payment.user?.name ?? "Customer"}</span>
                          <span className="mt-1 block max-w-44 truncate text-xs text-slate-500">
                            {payment.user?.email ?? ""}
                          </span>
                        </td>
                        <td className="max-w-56 px-5 py-4 text-slate-600">
                          {payment.items
                            .map((item) => `${item.productName} × ${item.quantity}`)
                            .join(", ")}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                          {formatRwf(payment.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              payment.status === "successful"
                                ? "bg-brand-50 text-brand-800"
                                : "bg-orange-50 text-orange-800"
                            }`}
                          >
                            {payment.status === "successful" ? "Paid" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
