export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl?: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export interface PaymentCartItem {
  productId: string;
  quantity: number;
}

export interface PaymentResponse {
  message: string;
  reference: string;
  status: "initiating" | "pending" | "successful";
  amount: number;
  currency: "RWF";
}

export interface PaymentStatusResponse {
  reference: string;
  status: "initiating" | "pending" | "successful" | "failed";
  amount: number;
  currency: "RWF";
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const apiBaseUrl = import.meta.env.DEV
  ? ""
  : configuredApiUrl || "https://e-commerce-backend.onrender.com";

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Could not reach the store server. Check your connection and try again."
    );
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `The request failed (${response.status}).`;
    throw new ApiRequestError(message, response.status);
  }

  return body as T;
};

export const signIn = (email: string, password: string) =>
  apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const signUp = (name: string, email: string, password: string) =>
  apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const requestPasswordReset = (email: string) =>
  apiRequest<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token: string, password: string) =>
  apiRequest<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

export const fetchProducts = (token?: string, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<{
    products: Product[];
    pagination: ProductPagination;
  }>(`/api/products?${params.toString()}`, {}, token);
};

export const fetchProduct = (id: string, token?: string) =>
  apiRequest<{ product: Product }>(
    `/api/products/${encodeURIComponent(id)}`,
    {},
    token
  );

export const createProduct = (formData: FormData, token: string) =>
  apiRequest<{ message: string; product: Product }>(
    "/api/products",
    { method: "POST", body: formData },
    token
  );

export const updateProduct = (
  id: string,
  formData: FormData,
  token: string
) =>
  apiRequest<{ message: string; product: Product }>(
    `/api/products/${encodeURIComponent(id)}`,
    { method: "PATCH", body: formData },
    token
  );

export const deleteProduct = (id: string, token: string) =>
  apiRequest<{ message: string }>(
    `/api/products/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    token
  );

export const startMomoPayment = (
  reference: string,
  payerPhone: string,
  items: PaymentCartItem[],
  token: string
) =>
  apiRequest<PaymentResponse>("/api/payments/mtn", {
    method: "POST",
    body: JSON.stringify({ reference, payerPhone, items }),
  }, token);

export const fetchMomoPaymentStatus = (reference: string, token: string) =>
  apiRequest<PaymentStatusResponse>(
    `/api/payments/${encodeURIComponent(reference)}/status`,
    {},
    token
  );
