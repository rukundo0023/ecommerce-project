import { RequestHandler } from "express";
import mongoose from "mongoose";
import Product from "../models/product";

type IdParams = { id: string };

interface NewProductBody {
  name: string;
  price: number;
  description: string;
  quantity: number;
}

const isNewProductBody = (body: unknown): body is NewProductBody => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }

  const product = body as Record<string, unknown>;
  return (
    typeof product.name === "string" &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    typeof product.description === "string" &&
    typeof product.quantity === "number" &&
    Number.isInteger(product.quantity)
  );
};

const isRequestBody = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object" && body !== null && !Array.isArray(body);

export const createProduct: RequestHandler = async (req, res) => {
  if (!isNewProductBody(req.body)) {
    res.status(400).json({
      message:
        "Provide name, description, price, and integer quantity in a JSON request body",
    });
    return;
  }

  try {
    const { name, price, description, quantity } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      quantity,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
      error,
    });
  }
};

export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
      error,
    });
  }
};

export const getProductById: RequestHandler<IdParams> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    res.status(500).json({
      message: "Failed to fetch product",
      error,
    });
  }
};

export const updateProduct: RequestHandler<IdParams> = async (req, res) => {
  if (!isRequestBody(req.body)) {
    res.status(400).json({
      message: "A JSON request body is required",
    });
    return;
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
      error,
    });
  }
};

export const deleteProduct: RequestHandler<IdParams> = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
      error,
    });
  }
};
