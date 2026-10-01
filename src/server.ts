import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import swaggerSpec from "./swagger";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.use("/api/auth", authRoutes);

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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `Swagger docs at http://localhost:${PORT}/api-docs`
    );
  });
};

void start();