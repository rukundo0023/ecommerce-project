import { RequestHandler } from "express";
import mongoose from "mongoose";
import Order from "../models/order";
import Product from "../models/product";
import User from "../models/user";
import { sendOrderConfirmationEmail } from "../services/emailService";
import {
  createPaginationMetadata,
  parsePagination,
} from "../utils/pagination";

type CreateOrderBody = {
  productId?: unknown;
  quantity?: unknown;
};

export const createOrder: RequestHandler = async (req, res) => {
  const body =
    typeof req.body === "object" && req.body !== null
      ? (req.body as CreateOrderBody)
      : {};
  const { productId, quantity } = body;

  if (
    typeof productId !== "string" ||
    !mongoose.Types.ObjectId.isValid(productId) ||
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    res.status(400).json({
      message: "Provide a valid productId and a positive whole-number quantity",
    });
    return;
  }

  if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) {
      res.status(401).json({ message: "Authenticated user no longer exists" });
      return;
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        quantity: { $gte: quantity },
      },
      {
        $inc: { quantity: -quantity },
      },
      { new: true }
    );

    if (!product) {
      const productExists = await Product.exists({ _id: productId });
      if (!productExists) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(409).json({ message: "Insufficient product stock" });
      return;
    }

    try {
      const order = await Order.create({
        user: req.userId,
        product: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
      });

      try {
        await sendOrderConfirmationEmail({
          orderId: order.id,
          customerName: user.name,
          email: user.email,
          productName: order.productName,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          totalPrice: order.totalPrice,
        });
      } catch (emailError) {
        console.error("Order confirmation email failed:", emailError);
      }

      res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      try {
        await Product.updateOne({ _id: product._id }, { $inc: { quantity } });
      } catch (stockRestoreError) {
        console.error(
          "Failed to restore product stock after order failure:",
          stockRestoreError
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

export const getMyOrders: RequestHandler = async (req, res) => {
  if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const pagination = parsePagination(req.query);
  if (!pagination) {
    res.status(400).json({
      message: "page must be a positive integer and limit must be between 1 and 100",
    });
    return;
  }

  try {
    const [orders, total] = await Promise.all([
      Order.find({ user: req.userId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Order.countDocuments({ user: req.userId }),
    ]);

    res.status(200).json({
      count: orders.length,
      pagination: createPaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
