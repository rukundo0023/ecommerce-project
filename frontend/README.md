# RukundoeShop frontend

React, TypeScript, Vite, and Tailwind CSS storefront for the ecommerce backend.
TanStack React Query manages server data caching, loading/error states, and
refreshing data after store and account updates.

## Run locally

Start the backend on `http://localhost:5000`, then run:

```sh
npm install
npm run dev
```

Vite proxies `/api` requests to the local backend. Registration and login use
the backend auth endpoints; the product catalogue, product details, and order
checkout require a signed-in account.

The product catalogue loads 12 items per backend page. Product search matches
names and descriptions across the full catalogue, with results paginated by the
backend. Price sorting applies to the currently loaded page.

## Deploy

Set `VITE_API_URL` to the public base URL of the backend service before building,
for example `https://your-backend-service.onrender.com`. If it is omitted, the
frontend uses `https://e-commerce-backend.onrender.com`.

The backend CORS configuration must permit the deployed frontend origin.

## Verify

```sh
npm run build
npm run lint
```
