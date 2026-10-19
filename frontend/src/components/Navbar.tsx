import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useToast } from "../context/useToast";
import { readCart } from "../lib/cart";

const wishlistStorageKey = (userId: string) => `rukundoe-wishlist-${userId}`;

const readWishlistCount = (userId: string) => {
  if (!userId) return 0;
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(wishlistStorageKey(userId)) ?? "[]"
    );
    return Array.isArray(value) ? value.length : 0;
  } catch {
    return 0;
  }
};

export default function Navbar() {
  const { auth, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(() =>
    readCart().reduce((total, item) => total + item.quantity, 0)
  );
  const [wishlistCount, setWishlistCount] = useState(() =>
    readWishlistCount(auth?.user.id ?? "")
  );

  useEffect(() => {
    const updateCount = () => {
      setCartCount(
        readCart().reduce((total, item) => total + item.quantity, 0)
      );
      setWishlistCount(readWishlistCount(auth?.user.id ?? ""));
    };
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("wishlist-updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("wishlist-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [auth?.user.id]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim().slice(0, 120);
    showToast(query ? `Searching for “${query}”.` : "Showing all products.", "info");
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const profilePath = auth?.user.role === "admin" ? "/admin" : "/dashboard";
  const notificationPath =
    auth?.user.role === "admin" ? "/admin#payments" : "/dashboard#orders";
  const profileName = auth?.user.name ?? "My account";
  const initials = profileName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-[0_3px_18px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-sm text-white transition group-hover:rotate-[-8deg]">R</span>
          <span>RukundoeShop<span className="text-accent-700">.</span></span>
        </Link>

        <form onSubmit={submitSearch} role="search" className="order-3 flex w-full sm:order-none sm:ml-4 sm:w-auto sm:flex-1 sm:max-w-xl">
          <label htmlFor="store-search" className="sr-only">Search products</label>
          <div className="flex w-full items-center rounded-full border border-slate-200 bg-slate-50 px-4 transition focus-within:border-brand-500 focus-within:bg-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-slate-400"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
            <input
              id="store-search"
              maxLength={120}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="shrink-0 text-xs font-semibold text-brand-800 hover:underline">Search</button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {auth && (
            <Link
              to={notificationPath}
              aria-label="Notifications and recent activity"
              title="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-brand-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          )}
          {auth?.user.role === "user" && (
            <Link
              to="/dashboard#wishlist"
              aria-label={`Wishlist, ${wishlistCount} saved items`}
              title="Wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
            >
              <span aria-hidden="true" className="text-xl">♡</span>
              {wishlistCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{wishlistCount}</span>}
            </Link>
          )}
          {auth?.user.role !== "admin" && (
            <Link
              to="/cart"
              aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
              title="Shopping cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-brand-50 hover:text-brand-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7"><path d="M5.5 8.5h13l1 12h-15l1-12Z" strokeLinejoin="round" /><path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" /></svg>
              {cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[9px] font-bold text-white">{cartCount}</span>}
            </Link>
          )}
          {auth ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link to={profilePath} aria-label={`Profile: ${profileName}`} title={profileName} className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                {initials}
              </Link>
              <span className="hidden max-w-32 truncate text-xs font-semibold text-slate-700 md:inline">{profileName}</span>
              <button type="button" onClick={signOut} className="text-xs font-medium text-slate-500 hover:text-brand-800">Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 text-sm font-semibold">
              <Link to="/login" className="text-slate-600 hover:text-brand-800">Login</Link>
              <Link to="/register" className="rounded-full bg-brand-700 px-4 py-2 text-white hover:bg-brand-800">Join</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
