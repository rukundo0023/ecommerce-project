
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerServicePage from "./pages/CustomerService";
import ShippingInformation from "./pages/ShippingInformation";
import ReturnsRefunds from "./pages/ReturnsRefunds";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Footer from "./components/Footer";
import { useAuth } from "./context/auth";

function RequireAuth({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white text-slate-900">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <Products />
                </RequireAuth>
              }
            />
            <Route
              path="/products/:id"
              element={
                <RequireAuth>
                  <ProductDetails />
                </RequireAuth>
              }
            />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <CustomerDashboard />
                </RequireAuth>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/contact"
              element={
                <CustomerServicePage
                  title="Contact Us"
                  intro="Need help with RukundoeShop? Get in touch and we’ll be happy to assist."
                  details={[
                    "For order questions, include your order number so we can help you faster.",
                    "You can reach us by email or phone using the contact details below.",
                  ]}
                  emailSubject="RukundoeShop Customer Support"
                />
              }
            />
            <Route path="/shipping-information" element={<ShippingInformation />} />
            <Route path="/returns-refunds" element={<ReturnsRefunds />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route
              path="*"
              element={
                <main className="mx-auto max-w-7xl px-5 py-16">
                  <h1 className="text-3xl font-bold">Page not found</h1>
                  <Link
                    to="/"
                    className="mt-4 inline-block text-brand-800 hover:underline"
                  >
                    Return home
                  </Link>
                </main>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;