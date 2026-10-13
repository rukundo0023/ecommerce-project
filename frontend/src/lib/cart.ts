export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  availableQuantity: number;
}

const CART_STORAGE_KEY = "shopease-cart";

export const readCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const value: unknown = JSON.parse(stored);
    return Array.isArray(value)
      ? value.filter(
          (item): item is CartItem =>
            typeof item === "object" &&
            item !== null &&
            "productId" in item &&
            typeof item.productId === "string" &&
            "name" in item &&
            typeof item.name === "string" &&
            "price" in item &&
            typeof item.price === "number" &&
            "quantity" in item &&
            typeof item.quantity === "number" &&
            "availableQuantity" in item &&
            typeof item.availableQuantity === "number"
        )
      : [];
  } catch {
    return [];
  }
};

export const writeCart = (items: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
};
