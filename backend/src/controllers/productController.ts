
import { RequestHandler } from "express";
import mongoose from "mongoose";
import Product from "../models/product";
import {
  uploadProductImage,
  uploadProductImageFromUrl,
} from "../config/cloudinary";
import {
  createPaginationMetadata,
  parsePagination,
} from "../utils/pagination";

type IdParams = { id: string };

const isProductValidationError = (
  error: unknown
): error is mongoose.Error.ValidationError | mongoose.Error.CastError =>
  error instanceof mongoose.Error.ValidationError ||
  error instanceof mongoose.Error.CastError;

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

    if (isProductValidationError(error)) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const getProducts: RequestHandler = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    res.status(400).json({
      message: "page must be a positive integer and limit must be between 1 and 100",
    });
    return;
  }

  try {
    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      count: products.length,
      pagination: createPaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
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

    const allowedFields = ["name", "price", "description", "quantity", "imageUrl"];
    const unexpectedField = Object.keys(req.body).find(
      (field) => !allowedFields.includes(field)
    );
    if (unexpectedField) {
      res.status(400).json({ message: `Unexpected product field: ${unexpectedField}` });
      return;
    }

    const updates: Record<string, unknown> = {};
    for (const field of ["name", "price", "description", "quantity"] as const) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (req.file) {
      updates.imageUrl = await uploadProductImage(req.file);
    } else if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
      if (typeof req.body.imageUrl !== "string") {
        res.status(400).json({ message: "imageUrl must be an HTTPS URL" });
        return;
      }
      updates.imageUrl = await uploadProductImageFromUrl(req.body.imageUrl);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "At least one product field is required" });
      return;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
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

    if (isProductValidationError(error)) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to update product" });
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
