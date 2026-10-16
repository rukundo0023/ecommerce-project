# RukundoeShop Ecommerce

RukundoeShop is an ecommerce project organized as two separate applications in one
Git repository:

- [`backend/`](./backend/README.md) — Express and TypeScript API
- [`frontend/`](./frontend/README.md) — React, TypeScript, and Vite storefront

## Run locally

Requirements: Node.js and npm, plus a MongoDB connection and the backend
services configured in the backend environment variables.

1. Configure the backend by following [backend setup](./backend/README.md),
   including creating `backend/.env` with the required values.
2. In one terminal, start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, start the storefront:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite. During development, the frontend proxies
   `/api` requests to the backend at `http://localhost:5000`.

## Verify the frontend

From the `frontend` directory, run:

```powershell
npm run build
npm run lint
```

## Deployment

Deploy the backend and frontend as separate services. Set the frontend's
`VITE_API_URL` to the public backend base URL when building, and configure the
backend to allow the deployed frontend origin. Keep credentials in environment
variables; do not commit `.env` files.
