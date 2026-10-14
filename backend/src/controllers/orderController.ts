import { RequestHandler } from "express";
import mongoose from "mongoose";
import Order from "../models/order";
import {
  createPaginationMetadata,
  parsePagination,
} from "../utils/pagination";

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
