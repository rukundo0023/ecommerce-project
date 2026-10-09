
import "dotenv/config";
import cors from "cors";

import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

import express from "express";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/db";
import { provisionAdminAccount } from "./services/adminService";
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import swaggerSpec from "./swagger";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// CORS: allow your deployed frontend to access this API
app.use(
  cors({
    origin: [
      "https://ecommerce-project000.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api/products", productRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "E-commerce API is running",
  });
});

const start = async (): Promise<void> => {
  await connectDB();

  try {
    await provisionAdminAccount();
  } catch (error) {
    console.error("Administrator account provisioning failed:", error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
};

void start();