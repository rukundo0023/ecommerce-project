
import { Link } from "react-router-dom";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand information */}
        <div>
          <Link to="/" className="text-2xl font-extrabold text-white">
            ShopEase<span className="text-accent-500">.</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
            Discover quality products at great prices. We make
            shopping simple, convenient, and enjoyable.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-bold text-white">Quick Links</h3>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-brand-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-brand-300">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-brand-300">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer service */}
        <div>
          <h3 className="font-bold text-white">Customer Service</h3>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/contact" className="hover:text-brand-300">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/shipping-information" className="hover:text-brand-300">
                Shipping Information
              </Link>
            </li>
            <li>
              <Link to="/returns-refunds" className="hover:text-brand-300">
                Returns & Refunds
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact information */}
        <div>
          <h3 className="font-bold text-white">Get in Touch</h3>

          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <a href="mailto:clevisrukundo@gmail.com" className="hover:text-brand-300">
                Email: clevisrukundo@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:0780381227" className="hover:text-brand-300">
                Phone: 0780381227
              </a>
            </li>
            <li>🌍 Online store</li>
          </ul>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {CURRENT_YEAR} ShopEase. All rights reserved.
          </p>

          <div className="flex justify-center gap-5">
            <Link to="/privacy-policy" className="hover:text-accent-500">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-accent-500">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}