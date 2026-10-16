import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import {
  ApiRequestError,
  fetchMomoPaymentStatus,
  startMomoPayment,
} from "../lib/api";
import { readCart, writeCart, type CartItem } from "../lib/cart";
import { formatRwf } from "../lib/currency";

export default function Cart() {
  const { auth } = useAuth();
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [payerPhone, setPayerPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState(() =>
    auth ? localStorage.getItem(`shopease-payment-${auth.user.id}`) ?? "" : ""
  );
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const paymentReferenceStorageKey = auth
    ? `shopease-payment-${auth.user.id}`
    : "";

  useEffect(() => {
    const updateCart = () => setItems(readCart());
    const updatePaymentReference = (event: StorageEvent) => {
      if (event.key === paymentReferenceStorageKey) {
        setPaymentReference(event.newValue ?? "");
        setPaymentSubmitted(false);
      }
    };
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("storage", updateCart);
    window.addEventListener("storage", updatePaymentReference);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("storage", updatePaymentReference);
    };
  }, [paymentReferenceStorageKey]);

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

  const applyPaymentStatus = (
    payment: Awaited<ReturnType<typeof fetchMomoPaymentStatus>>
  ): boolean => {
    setPaymentAmount(payment.amount);
    if (payment.status === "successful") {
      writeCart([]);
      setItems([]);
      setPaymentReference("");
      setPaymentAmount(null);
      if (paymentReferenceStorageKey) {
        localStorage.removeItem(paymentReferenceStorageKey);
      }
      setPaymentSubmitted(false);
      setNotice("Payment confirmed. Your order has been placed.");
      return true;
    }
    if (payment.status === "failed") {
      setPaymentReference("");
      setPaymentAmount(null);
      if (paymentReferenceStorageKey) {
        localStorage.removeItem(paymentReferenceStorageKey);
      }
      setPaymentSubmitted(false);
      setNotice("");
      setError("The payment was not completed. You can try again.");
      return true;
    }
    return false;
  };

  const monitorPayment = async (reference: string, token: string) => {
    setCheckingPayment(true);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 5000);
      });

      try {
        const payment = await fetchMomoPaymentStatus(reference, token);
        if (applyPaymentStatus(payment)) {
          setCheckingPayment(false);
          return;
        }
      } catch (statusError) {
        setError(
          statusError instanceof Error
            ? statusError.message
            : "Unable to check the MTN MoMo payment status."
        );
        setCheckingPayment(false);
        return;
      }
    }

    setNotice(
      "Payment is still pending. Approve the MTN MoMo prompt and check again."
    );
    setCheckingPayment(false);
  };

  const checkout = async () => {
    if (!auth) return;
    if (!/^(?:\+?2507\d{8}|07\d{8})$/.test(payerPhone.replace(/[\s()-]/g, ""))) {
      setError("Enter a valid Rwanda mobile number, for example 0781234567.");
      return;
    }
    setCheckingOut(true);
    setError("");
    setNotice("");
    const reference = paymentReference || crypto.randomUUID();
    if (!paymentReference) {
      setPaymentReference(reference);
      if (paymentReferenceStorageKey) {
        localStorage.setItem(paymentReferenceStorageKey, reference);
      }
    }

    try {
      const response = await startMomoPayment(
        reference,
        payerPhone,
        items.map(({ productId, quantity }) => ({ productId, quantity })),
        auth.token
      );
      setPaymentReference(response.reference);
      setPaymentSubmitted(true);
      setPaymentAmount(response.amount);
      if (paymentReferenceStorageKey) {
        localStorage.setItem(paymentReferenceStorageKey, response.reference);
      }
      setNotice(
        `${response.message} Reference: ${response.reference}. Keep this page open while we verify the payment.`
      );
      if (response.status === "successful") {
        applyPaymentStatus(response);
      } else {
        void monitorPayment(response.reference, auth.token);
      }
    } catch (checkoutError) {
      if (checkoutError instanceof ApiRequestError) {
        setPaymentReference("");
        setPaymentSubmitted(false);
        setPaymentAmount(null);
        if (paymentReferenceStorageKey) {
          localStorage.removeItem(paymentReferenceStorageKey);
        }
      }
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start the MTN MoMo payment."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!auth || !paymentReference) return;
    setCheckingPayment(true);
    setError("");

    try {
      const payment = await fetchMomoPaymentStatus(paymentReference, auth.token);
      if (!applyPaymentStatus(payment)) {
        setNotice(
          `Payment is ${payment.status}. Approve the MTN MoMo prompt and check again.`
        );
      }
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to check the MTN MoMo payment status."
      );
    } finally {
      setCheckingPayment(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="mx-auto min-h-96 max-w-7xl px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Your edit</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Shopping cart</h1>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-lg bg-brand-50 p-4 text-brand-800">{notice}</p>}

      {items.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl" aria-hidden="true">🛒</p>
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-slate-600">Your next everyday favorite is waiting to be found.</p>
          <Link to="/products" className="mt-5 inline-block rounded-full bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {items.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-center gap-4 p-5">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>
                )}
                <div className="min-w-40 flex-1">
                  <Link to={`/products/${item.productId}`} className="font-semibold hover:text-brand-800">{item.name}</Link>
                  <p className="mt-1 text-sm text-gray-600">{formatRwf(item.price)} each</p>
                </div>
                <label className="text-sm text-gray-600">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={item.availableQuantity}
                    value={item.quantity}
                    disabled={Boolean(paymentReference)}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isInteger(value) && value >= 1 && value <= item.availableQuantity) {
                        updateQuantity(item.productId, value);
                      }
                    }}
                    className="mt-1 block w-20 rounded-lg border border-gray-300 px-2 py-2 disabled:bg-gray-100"
                  />
                </label>
                <p className="w-24 text-right font-semibold">{formatRwf(item.price * item.quantity)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  disabled={Boolean(paymentReference)}
                  className="text-sm text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span
                aria-hidden="true"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-yellow-400 text-sm font-black tracking-tight text-slate-950"
              >
                MTN
              </span>
              <div>
                <p className="font-semibold text-slate-900">MTN Mobile Money</p>
                <p className="mt-0.5 text-xs text-slate-600">Secure payment in Rwanda</p>
              </div>
            </div>
            <label className="mt-5 block font-semibold text-slate-900">
              MTN Rwanda phone number
              <input
                type="tel"
                autoComplete="tel"
                value={payerPhone}
                onChange={(event) => setPayerPhone(event.target.value)}
                placeholder="0781234567"
                disabled={Boolean(paymentReference)}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
              <span>Total</span>
              <span>{formatRwf(paymentAmount ?? total)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              You will receive an MTN MoMo prompt. Your order is placed only
              after the payment is confirmed.
            </p>
            {!auth ? (
              <Link to="/login" className="mt-5 block rounded-full bg-brand-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-brand-800">
                Sign in to checkout
              </Link>
            ) : (
              paymentReference && paymentSubmitted ? (
                <button
                  type="button"
                  onClick={checkPaymentStatus}
                  disabled={checkingPayment}
                  className="mt-5 w-full rounded-full bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {checkingPayment ? "Checking payment..." : "Check payment status"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkingOut || items.length === 0}
                  className="mt-5 w-full rounded-full bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {checkingOut
                    ? "Starting payment..."
                    : paymentReference
                      ? "Retry payment request"
                      : "Pay with MTN MoMo"}
                </button>
              )
            )}
            <p className="mt-3 text-xs leading-5 text-gray-500">Orders are created for each cart item. The server confirms stock before placing each order.</p>
          </section>
        </div>
      )}
    </main>
  );
}
