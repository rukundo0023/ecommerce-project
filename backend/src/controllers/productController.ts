
import { RequestHandler } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import Product, { type IProduct, PRODUCT_CATEGORIES } from "../models/product";
import {
  uploadProductImage,
  uploadProductImageFromUrl,
} from "../config/cloudinary";
import {
  createPaginationMetadata,
  parsePagination,
} from "../utils/pagination";

type IdParams = { id: string };

const parseNonNegativeNumber = (value: unknown): number | null => {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const parseNonNegativeInteger = (value: unknown): number | null => {
  const parsed = parseNonNegativeNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) ? parsed : null;
};

const isProductValidationError = (
  error: unknown
): error is mongoose.Error.ValidationError | mongoose.Error.CastError =>
  error instanceof mongoose.Error.ValidationError ||
  error instanceof mongoose.Error.CastError;

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      quantity,
      imageUrl: inputImageUrl,
    } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedDescription =
      typeof description === "string" ? description.trim() : "";
    const normalizedPrice = parseNonNegativeNumber(price);
    const normalizedQuantity = parseNonNegativeInteger(quantity);
    if (!normalizedName || normalizedName.length > 120) {
      res.status(400).json({
        message: "Product name must contain 1 to 120 non-space characters",
      });
      return;
    }
    if (!normalizedDescription || normalizedDescription.length > 2000) {
      res.status(400).json({
        message: "Product description must contain 1 to 2000 non-space characters",
      });
      return;
    }
    if (normalizedPrice === null) {
      res.status(400).json({ message: "Product price must be a valid non-negative number" });
      return;
    }
    if (normalizedQuantity === null) {
      res.status(400).json({ message: "Product quantity must be a non-negative whole number" });
      return;
    }

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
      name: normalizedName,
      category,
      price: normalizedPrice,
      description: normalizedDescription,
      quantity: normalizedQuantity,
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

  if (req.query.search !== undefined && typeof req.query.search !== "string") {
    res.status(400).json({ message: "search must be a string" });
    return;
  }

  const category = req.query.category;
  const categoryFilter =
    typeof category === "string"
      ? PRODUCT_CATEGORIES.find((allowedCategory) => allowedCategory === category)
      : undefined;
  if (category !== undefined && !categoryFilter) {
    res.status(400).json({
      message: `category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`,
    });
    return;
  }

  const search = typeof req.query.search === "string"
    ? req.query.search.trim()
    : "";
  const filters: QueryFilter<IProduct>[] = [];
  if (categoryFilter === "Electronics") {
    filters.push({
      $or: [
        { category: "Electronics" },
        { category: { $exists: false } },
      ],
    });
  } else if (categoryFilter) {
    filters.push({ category: categoryFilter });
  }
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filters.push({
      $or: [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ],
    });
  }
  const filter: QueryFilter<IProduct> =
    filters.length > 1 ? { $and: filters } : filters[0] ?? {};

  try {
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
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

    const allowedFields = ["name", "category", "price", "description", "quantity", "imageUrl"];
    const unexpectedField = Object.keys(req.body).find(
      (field) => !allowedFields.includes(field)
    );
    if (unexpectedField) {
      res.status(400).json({ message: `Unexpected product field: ${unexpectedField}` });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
      if (!name || name.length > 120) {
        res.status(400).json({
          message: "Product name must contain 1 to 120 non-space characters",
        });
        return;
      }
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "category")) {
      updates.category = req.body.category;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "price")) {
      const price = parseNonNegativeNumber(req.body.price);
      if (price === null) {
        res.status(400).json({ message: "Product price must be a valid non-negative number" });
        return;
      }
      updates.price = price;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      const description =
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "";
      if (!description || description.length > 2000) {
        res.status(400).json({
          message: "Product description must contain 1 to 2000 non-space characters",
        });
        return;
      }
      updates.description = description;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "quantity")) {
      const quantity = parseNonNegativeInteger(req.body.quantity);
      if (quantity === null) {
        res.status(400).json({ message: "Product quantity must be a non-negative whole number" });
        return;
      }
      updates.quantity = quantity;
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
