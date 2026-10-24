import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/auth";
import { useToast } from "../context/useToast";
import {
  fetchProducts,
  PRODUCT_CATEGORIES,
  type Product,
} from "../lib/api";
import { formatRwf } from "../lib/currency";
import { queryKeys } from "../lib/queryClient";
import { useVoiceSearch } from "../hooks/useVoiceSearch";

const PRODUCTS_PER_PAGE = 12;
const EMPTY_PRODUCTS: Product[] = [];

export default function Products() {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const requestedCategory = searchParams.get("category") ?? "";
  const category = PRODUCT_CATEGORIES.find((item) => item === requestedCategory) ?? "";
  const [sort, setSort] = useState("newest");
  const [pageState, setPageState] = useState({ search, page: 1 });
  const page = pageState.search === search ? pageState.page : 1;
  const setPage = (nextPage: number | ((current: number) => number)) => {
    setPageState((current) => {
      const currentPage = current.search === search ? current.page : 1;
      return {
        search,
        page:
          typeof nextPage === "function"
            ? nextPage(currentPage)
            : nextPage,
      };
    });
  };
  const productsQuery = useQuery({
    queryKey: queryKeys.products(
      auth?.user.id ?? "guest",
      page,
      PRODUCTS_PER_PAGE,
      search,
      category
    ),
    queryFn: () =>
      fetchProducts(auth?.token, page, PRODUCTS_PER_PAGE, search, category),
  });
  const products = productsQuery.data?.products ?? EMPTY_PRODUCTS;
  const pagination = productsQuery.data?.pagination;
  const error = productsQuery.error instanceof Error
    ? productsQuery.error.message
    : "";
  const loading = productsQuery.isPending;
  const visibleProducts = useMemo(() => {
    if (sort === "price-low") return [...products].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [products, sort]);

  const applySearch = (nextSearch: string) => {
    const query = nextSearch.trim().slice(0, 120);
    showToast(query ? `Searching for “${query}”.` : "Showing all products.", "info");
    setPageState({ search: query, page: 1 });
    const nextParams = new URLSearchParams(searchParams);
    if (query) nextParams.set("search", query);
    else nextParams.delete("search");
    setSearchParams(nextParams);
  };
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    applySearch(String(formData.get("search") ?? ""));
  };
  const voiceSearch = useVoiceSearch(
    (transcript) => applySearch(transcript),
    (message) => showToast(message, "error")
  );

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:pt-14">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-7 py-10 sm:px-11 sm:py-14">
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[1px] border-brand-700/10 sm:right-16" />
        <div className="absolute -right-2 -top-16 h-48 w-48 rounded-full border-[1px] border-brand-700/10 sm:right-24" />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-accent-700">The RukundoeShop edit</p>
        <h1 className="relative mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Find your next favorite.</h1>
        <p className="relative mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Thoughtful everyday finds, all in one place. Take your time and explore.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {loading
              ? "Finding good things..."
              : `${visibleProducts.length} ${visibleProducts.length === 1 ? "item" : "items"} on this page${pagination ? ` · ${pagination.total} total` : ""}`}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form onSubmit={handleSearch} role="search" className="flex min-w-0">
              <label className="sr-only" htmlFor="product-search">Search products</label>
              <input key={search} id="product-search" name="search" maxLength={120} defaultValue={search} placeholder={voiceSearch.listening ? "Listening..." : "Search products"} className="min-w-0 w-full rounded-l-full border border-r-0 border-brand-200 bg-white py-3 pl-4 pr-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 sm:w-56" />
              <button
                type="button"
                onClick={voiceSearch.listening ? voiceSearch.stop : voiceSearch.start}
                disabled={!voiceSearch.supported}
                aria-label={voiceSearch.listening ? "Stop voice search" : "Start voice search"}
                aria-pressed={voiceSearch.listening}
                title={voiceSearch.supported ? "Search by voice" : "Voice search is not supported in this browser"}
                className={`grid h-[46px] w-11 shrink-0 place-items-center border-y border-brand-200 bg-white transition ${voiceSearch.listening ? "animate-pulse text-accent-700" : "text-slate-500 hover:bg-brand-50 hover:text-brand-800"} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <rect x="9" y="2.5" width="6" height="12" rx="3" />
                  <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V22m-4 0h8" strokeLinecap="round" />
                </svg>
              </button>
              <button type="submit" aria-label="Search products" className="grid h-[46px] w-12 shrink-0 place-items-center rounded-r-full border border-brand-700 bg-brand-700 text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
              </button>
            </form>
            <label className="sr-only" htmlFor="product-category">Filter by category</label>
            <select
              id="product-category"
              value={category}
              onChange={(event) => {
                const nextParams = new URLSearchParams(searchParams);
                if (event.target.value) nextParams.set("category", event.target.value);
                else nextParams.delete("category");
                setSearchParams(nextParams);
                setPage(1);
              }}
              className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-brand-600"
            >
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="product-sort">Sort products on this page</label>
            <select id="product-sort" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-brand-600">
              <option value="newest">Recently added</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
      </div>
      {loading && (
        <ul aria-label="Loading products" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <li key={item} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-64 bg-slate-100" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /></div></li>)}
        </ul>
      )}
      {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 p-5 text-red-800">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <span className="text-3xl text-brand-600">✳</span>
          <p className="mt-3 font-semibold text-slate-900">{search ? "No matching products found" : "The shelves are getting ready"}</p>
          <p className="mt-2 text-sm text-slate-600">{search ? `Try another search for “${search}”.` : category ? `There are no products in ${category} yet.` : "Check back soon for new finds."}</p>
        </div>
      )}

      {visibleProducts.length > 0 && (
        <ul className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <li key={product._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-900/[0.08]">
              <Link to={`/products/${product._id}`} className="block">
                <div className="relative overflow-hidden bg-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} loading={index < 3 ? "eager" : "lazy"} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 text-brand-700"><span className="text-5xl">✳</span></div>
                )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-brand-800 backdrop-blur">RukundoeShop pick</span>
                  {product.quantity <= 0 && <span className="absolute bottom-4 left-4 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white">Currently unavailable</span>}
                </div>
                <div className="p-5 sm:p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-700">{product.category}</p>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                    <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-800">{formatRwf(product.price)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <p className="text-xs font-medium text-slate-500">
                      {product.quantity > 0 ? "Ready to make it yours" : "Restocking soon"}
                    </p>
                    <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full border border-brand-200 text-brand-800 transition group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">↗</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Product pages"
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={!pagination.hasPreviousPage}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:border-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span aria-live="polite" className="px-2 text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination.hasNextPage}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:border-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
