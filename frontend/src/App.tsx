
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white text-slate-900">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/admin/products" element={<AdminProducts />} />
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
                  intro="Need help with ShopEase? Get in touch and we’ll be happy to assist."
                  details={[
                    "For order questions, include your order number so we can help you faster.",
                    "You can reach us by email or phone using the contact details below.",
                  ]}
                  emailSubject="ShopEase Customer Support"
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