import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import { fetchProducts, type Product } from "../lib/api";

const EMPTY_PRODUCTS: Product[] = [];

export default function Products() {
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loaded, setLoaded] = useState<{
    token: string | null;
    products: Product[];
    error: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetchProducts(auth?.token)
      .then((result) => {
        if (active) {
          setLoaded({ token: auth?.token ?? null, products: result.products, error: "" });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setLoaded({
            token: auth?.token ?? null,
            products: [],
            error: requestError instanceof Error
              ? requestError.message
              : "Unable to load products.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [auth]);

  const result = loaded?.token === (auth?.token ?? null) ? loaded : null;
  const products = result?.products ?? EMPTY_PRODUCTS;
  const error = result?.error ?? "";
  const loading = !result;
  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter((product) =>
      `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch)
    );
    if (sort === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, search, sort]);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:pt-14">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#e9eee5] px-7 py-10 sm:px-11 sm:py-14">
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[1px] border-[#315b49]/10 sm:right-16" />
        <div className="absolute -right-2 -top-16 h-48 w-48 rounded-full border-[1px] border-[#315b49]/10 sm:right-24" />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#9a674b]">The ShopEase edit</p>
        <h1 className="relative mt-3 text-4xl font-semibold tracking-tight text-[#24372c] sm:text-5xl">Find your next favorite.</h1>
        <p className="relative mt-4 max-w-xl text-sm leading-6 text-[#62665c] sm:text-base">Thoughtful everyday finds, all in one place. Take your time and explore.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#717267]">{loading ? "Finding good things..." : `${visibleProducts.length} ${visibleProducts.length === 1 ? "item" : "items"} to explore`}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <span className="sr-only">Search products</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" className="w-full rounded-full border border-[#dedbd1] bg-[#fffdf8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#66836c] sm:w-64" />
            </label>
            <label className="sr-only" htmlFor="product-sort">Sort products</label>
            <select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-[#dedbd1] bg-[#fffdf8] px-4 py-3 text-sm text-[#41483f] outline-none focus:border-[#66836c]">
              <option value="newest">Recently added</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
      </div>
      {loading && (
        <ul aria-label="Loading products" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <li key={item} className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-[#fffdf8]"><div className="h-64 bg-[#eeece3]" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-[#eeece3]" /><div className="h-3 w-full rounded bg-[#eeece3]" /></div></li>)}
        </ul>
      )}
      {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 p-5 text-red-800">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <div className="mt-7 rounded-2xl border border-[#e3dfd4] bg-[#fffdf8] px-6 py-14 text-center">
          <span className="text-3xl text-[#9caf91]">✳</span>
          <p className="mt-3 font-semibold text-[#34483a]">The shelves are getting ready</p>
          <p className="mt-2 text-sm text-[#77796f]">Check back soon for new finds.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && visibleProducts.length === 0 && (
        <p className="mt-7 rounded-2xl border border-[#e3dfd4] bg-[#fffdf8] p-8 text-center text-sm text-[#77796f]">No products match “{search}”. Try another search.</p>
      )}

      {visibleProducts.length > 0 && (
        <ul className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <li key={product._id} className="group overflow-hidden rounded-2xl border border-[#e8e4da] bg-[#fffdf8] transition duration-300 hover:-translate-y-1 hover:border-[#c7d3c4] hover:shadow-xl hover:shadow-[#304536]/[0.08]">
              <Link to={`/products/${product._id}`} className="block">
                <div className="relative overflow-hidden bg-[#f0ede4]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} loading={index < 3 ? "eager" : "lazy"} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#e6e8dc,transparent_55%),linear-gradient(135deg,#f0ede4,#e8dfd0)] text-[#6f846c]"><span className="text-5xl">✳</span></div>
                )}
                  <span className="absolute left-4 top-4 rounded-full bg-[#fffdf8]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#315b49] backdrop-blur">ShopEase pick</span>
                  {product.quantity <= 0 && <span className="absolute bottom-4 left-4 rounded-full bg-[#283d31]/90 px-3 py-1.5 text-xs font-semibold text-white">Currently unavailable</span>}
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-[#29382e]">{product.name}</h2>
                    <span className="shrink-0 rounded-full bg-[#edf1e9] px-3 py-1.5 text-sm font-bold text-[#315b49]">{product.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#77796f]">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#eeebe2] pt-4">
                    <p className="text-xs font-medium text-[#73756b]">
                      {product.quantity > 0 ? "Ready to make it yours" : "Restocking soon"}
                    </p>
                    <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full border border-[#d8dfd4] text-[#315b49] transition group-hover:border-[#244b3d] group-hover:bg-[#244b3d] group-hover:text-white">↗</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
