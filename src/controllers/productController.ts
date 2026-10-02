
import { RequestHandler } from "express";
import mongoose from "mongoose";
import Product from "../models/product";
import {
  uploadProductImage,
  uploadProductImageFromUrl,
} from "../config/cloudinary";

type IdParams = { id: string };

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      quantity,
      imageUrl: inputImageUrl,
    } = req.body;

    let imageUrl: string | undefined;

    const file = req.file;

    if (file) {
      imageUrl = await uploadProductImage(file);
    }

    if (!file && inputImageUrl) {
      if (typeof inputImageUrl !== "string") {
        res.status(400).json({ message: "imageUrl must be an HTTPS URL" });
        return;
      }
      imageUrl = await uploadProductImageFromUrl(inputImageUrl);
    }

    const product = await Product.create({
      name,
      price,
      description,
      quantity,
      imageUrl,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
      error: error instanceof Error ? error.message : error,
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
      error: error instanceof Error ? error.message : error,
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
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateProduct: RequestHandler<IdParams> = async (req, res) => {
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
      error: error instanceof Error ? error.message : error,
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
      error: error instanceof Error ? error.message : error,
    });
  }
};
