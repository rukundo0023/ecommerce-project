import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
    },
  },
});

export const queryKeys = {
  products: (
    userId: string,
    page: number,
    limit: number,
    search: string,
    category: string
  ) =>
    ["products", userId, page, limit, search, category] as const,
  product: (userId: string, productId: string) =>
    ["product", userId, productId] as const,
  adminProducts: (userId: string) => ["admin", userId, "products"] as const,
  adminDashboard: (userId: string) => ["admin", userId, "dashboard"] as const,
  customerOrders: (userId: string, page: number) =>
    ["account", userId, "orders", page] as const,
  customerPayments: (userId: string) =>
    ["account", userId, "payments"] as const,
  customerRecommendations: (userId: string) =>
    ["account", userId, "recommendations"] as const,
};
