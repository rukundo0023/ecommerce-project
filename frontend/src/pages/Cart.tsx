import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import { useToast } from "../context/useToast";
import { placeCustomerOrder } from "../lib/api";
import { readCart, writeCart, type CartItem } from "../lib/cart";
import { formatRwf } from "../lib/currency";
import { readSavedDeliveryAddress, saveDeliveryAddress } from "../lib/profile";
import { queryKeys } from "../lib/queryClient";

interface CheckoutFields {
  deliveryAddress: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [checkoutReference, setCheckoutReference] = useState<string | null>(null);
  const [savedAddress] = useState(() =>
    readSavedDeliveryAddress(auth?.user.id ?? "")
  );
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<CheckoutFields>({
    defaultValues: { deliveryAddress: savedAddress.address },
    mode: "onBlur",
  });
  const [error, setError] = useState(savedAddress.error);

  const updateQuantity = (productId: string, quantity: number) => {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    writeCart(next);
    setItems(next);
    setCheckoutReference(null);
    setError("");
  };

  const removeItem = (productId: string) => {
    const next = items.filter((item) => item.productId !== productId);
    writeCart(next);
    setItems(next);
    setCheckoutReference(null);
    setError("");
  };

  const checkout = async ({ deliveryAddress }: CheckoutFields) => {
    if (!auth) return;
    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > item.availableQuantity ||
          !Number.isFinite(item.price) ||
          item.price < 0
      )
    ) {
      const message = "Check your cart quantities and try checkout again.";
      setError(message);
      showToast(message, "error");
      return;
    }
    setError("");
    setSubmitting(true);
    const reference = checkoutReference ?? crypto.randomUUID();
    if (!checkoutReference) setCheckoutReference(reference);

    try {
      const response = await placeCustomerOrder(
        reference,
        deliveryAddress.trim(),
        items.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
        auth.token
      );
      setCheckoutReference(null);
      writeCart([]);
      setItems([]);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customerOrders(auth.user.id, 1),
      });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
      try {
        saveDeliveryAddress(auth.user.id, deliveryAddress.trim());
      } catch {
        showToast("Order placed. The address could not be saved for your next order.", "info");
      }
      showToast(response.message, "success");
      navigate("/dashboard#orders", { state: { orderPlaced: true } });
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to place your order.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="mx-auto min-h-96 max-w-7xl px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Your edit</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Shopping cart</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Place your order now and it will appear in your dashboard. Payment is marked pending while payment services are unavailable.
      </p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}

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
                    step={1}
                    required
                    value={item.quantity}
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
                  className="text-sm text-red-700 hover:underline"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">Payment pending</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                Your order can be placed while payment services are unavailable. It will not be marked as paid.
              </p>
            </div>
            <form noValidate onSubmit={handleSubmit(checkout)}>
              <label htmlFor="delivery-address" className="mt-5 block font-semibold text-slate-900">
                Delivery address
              </label>
              <textarea
                id="delivery-address"
                rows={3}
                maxLength={300}
                placeholder="Enter your street, area, and delivery details"
                aria-invalid={Boolean(formErrors.deliveryAddress)}
                aria-describedby={formErrors.deliveryAddress ? "delivery-address-error" : "delivery-address-help"}
                {...register("deliveryAddress", {
                  required: "Enter the address where this order should be delivered.",
                  maxLength: {
                    value: 300,
                    message: "Delivery address must be 300 characters or fewer.",
                  },
                  validate: (value) =>
                    Boolean(value.trim()) || "Enter a delivery address that includes non-space characters.",
                })}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 font-normal disabled:bg-gray-100"
              />
              {formErrors.deliveryAddress ? (
                <p id="delivery-address-error" role="alert" className="mt-1 text-xs text-red-700">
                  {formErrors.deliveryAddress.message}
                </p>
              ) : (
                <p id="delivery-address-help" className="mt-1 text-xs text-gray-500">
                  {savedAddress.address ? "Prefilled from your saved dashboard address." : "You can save this address to your dashboard after checkout."}
                </p>
              )}
              <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
                <span>Total</span>
                <span>{formatRwf(total)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                Product stock is checked and reserved when the order is placed. You can see every item and its delivery progress on your customer dashboard.
              </p>
              {!auth ? (
                <Link to="/login" className="mt-5 block rounded-full bg-brand-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-brand-800">
                  Sign in to checkout
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={items.length === 0 || submitting}
                  className="mt-5 w-full rounded-full bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? "Placing order..." : "Place order · payment pending"}
                </button>
              )}
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
