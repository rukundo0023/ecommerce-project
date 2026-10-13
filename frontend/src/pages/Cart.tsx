import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import { placeOrder } from "../lib/api";
import { readCart, writeCart, type CartItem } from "../lib/cart";

const paymentMethods = [
  { id: "mtn", name: "MTN Mobile Money", detail: "Pay with MTN MoMo" },
  { id: "airtel", name: "Airtel Money", detail: "Pay with Airtel Money" },
  { id: "paypal", name: "PayPal", detail: "Pay with your PayPal account" },
] as const;

export default function Cart() {
  const { auth } = useAuth();
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof paymentMethods)[number]["id"] | ""
  >("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const updateCart = () => setItems(readCart());
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    writeCart(next);
    setItems(next);
    setError("");
  };

  const removeItem = (productId: string) => {
    const next = items.filter((item) => item.productId !== productId);
    writeCart(next);
    setItems(next);
    setNotice("");
    setError("");
  };

  const checkout = async () => {
    if (!auth) return;
    if (!paymentMethod) {
      setError("Choose a payment method to continue.");
      return;
    }
    setCheckingOut(true);
    setError("");
    setNotice("");
    let placedCount = 0;

    for (const item of items) {
      try {
        await placeOrder(item.productId, item.quantity, auth.token);
        placedCount += 1;
        const remaining = readCart().filter(
          (cartItem) => cartItem.productId !== item.productId
        );
        writeCart(remaining);
        setItems(remaining);
      } catch (checkoutError) {
        setError(
          `${placedCount > 0 ? `${placedCount} order(s) were placed. ` : ""}${
            checkoutError instanceof Error
              ? checkoutError.message
              : "Unable to complete checkout."
          }`
        );
        break;
      }
    }

    if (placedCount > 0 && readCart().length === 0) {
      setNotice(
        placedCount === 1
          ? "Your order was placed successfully. No payment was charged; payment processing will be available once the payment provider is connected."
          : `${placedCount} orders were placed successfully. No payment was charged; payment processing will be available once the payment provider is connected.`
      );
    }
    setCheckingOut(false);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="mx-auto min-h-96 max-w-7xl px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a36d4b]">Your edit</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#28382e]">Shopping cart</h1>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-green-800">{notice}</p>}

      {items.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-[#e8e4da] bg-[#fffdf8] p-8 text-center shadow-sm">
          <p className="text-5xl" aria-hidden="true">🛒</p>
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-[#77796f]">Your next everyday favorite is waiting to be found.</p>
          <Link to="/products" className="mt-5 inline-block rounded-full bg-emerald-800 px-6 py-3 font-semibold text-white transition hover:bg-emerald-900">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <ul className="divide-y divide-[#ebe7dd] rounded-2xl border border-[#e8e4da] bg-[#fffdf8]">
            {items.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-center gap-4 p-5">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#f0ede4] text-xs text-stone-500">No image</div>
                )}
                <div className="min-w-40 flex-1">
                  <Link to={`/products/${item.productId}`} className="font-semibold hover:text-emerald-800">{item.name}</Link>
                  <p className="mt-1 text-sm text-gray-600">{item.price.toFixed(2)} each</p>
                </div>
                <label className="text-sm text-gray-600">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={item.availableQuantity}
                    value={item.quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isInteger(value) && value >= 1 && value <= item.availableQuantity) {
                        updateQuantity(item.productId, value);
                      }
                    }}
                    className="mt-1 block w-20 rounded-lg border border-gray-300 px-2 py-2"
                  />
                </label>
                <p className="w-24 text-right font-semibold">{(item.price * item.quantity).toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-700 hover:underline"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <section className="h-fit rounded-2xl border border-[#e8e4da] bg-[#fffdf8] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#28382e]">Order summary</h2>
            <fieldset className="mt-5">
              <legend className="font-semibold text-[#28382e]">Payment method</legend>
              <div className="mt-3 space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      paymentMethod === method.id
                        ? "border-[#315b49] bg-[#f1f5ef]"
                        : "border-[#e8e4da] hover:border-[#b7c7b2]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => {
                        setPaymentMethod(method.id);
                        setError("");
                      }}
                      className="accent-[#244b3d]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#28382e]">
                        {method.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {method.detail}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-5 flex justify-between border-t border-[#ebe7dd] pt-4 font-bold text-[#28382e]">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Payment processing is not connected yet. Placing your order will
              not charge you.
            </p>
            {!auth ? (
              <Link to="/login" className="mt-5 block rounded-full bg-emerald-800 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-900">
                Sign in to checkout
              </Link>
            ) : (
              <button
                type="button"
                onClick={checkout}
                disabled={checkingOut || !paymentMethod}
                className="mt-5 w-full rounded-full bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
              >
                {checkingOut ? "Placing order..." : "Place order"}
              </button>
            )}
            <p className="mt-3 text-xs leading-5 text-gray-500">Orders are created for each cart item. The server confirms stock before placing each order.</p>
          </section>
        </div>
      )}
    </main>
  );
}
