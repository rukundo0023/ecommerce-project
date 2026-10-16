
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/auth";
import { readCart } from "../lib/cart";

export default function Navbar() {
  const { auth, signOut } = useAuth();
  const [cartCount, setCartCount] = useState(() =>
    readCart().reduce((total, item) => total + item.quantity, 0)
  );

  useEffect(() => {
    const updateCount = () =>
      setCartCount(
        readCart().reduce((total, item) => total + item.quantity, 0)
      );
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition hover:text-brand-800 ${
      isActive ? "font-semibold text-brand-900" : "text-slate-600"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-[0_3px_18px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="group flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-sm text-white transition group-hover:rotate-[-8deg]">R</span>
          RukundoeShop<span className="-ml-2 text-accent-700">.</span>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-4 text-sm sm:gap-7">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Discover
          </NavLink>
          {auth?.user.role === "admin" && (
            <>
              <NavLink to="/admin" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/products" className={linkClass}>
                Manage products
              </NavLink>
            </>
          )}
          {auth ? (
            <>
              <span className="hidden text-slate-500 sm:inline">Hi, {auth.user.name.split(" ")[0]}</span>
              <button type="button" onClick={signOut} className="text-slate-600 transition hover:text-brand-800">
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                isActive
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-slate-300 text-brand-800 hover:border-brand-700 hover:bg-brand-50"
              }`
            }
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
              <path d="M5.5 8.5h13l1 12h-15l1-12Z" strokeLinejoin="round" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" />
            </svg>
            Cart{cartCount > 0 ? ` · ${cartCount}` : ""}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}