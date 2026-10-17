import { RequestHandler } from "express";
import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/order";
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
    const [result] = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $group: {
          _id: { $ifNull: ["$paymentReference", { $toString: "$_id" }] },
          orderId: { $first: "$_id" },
          orderNumber: {
            $first: { $ifNull: ["$paymentReference", { $toString: "$_id" }] },
          },
          productName: { $first: "$productName" },
          imageUrl: { $first: "$imageUrl" },
          quantity: { $sum: "$quantity" },
          totalPrice: { $sum: "$totalPrice" },
          status: { $first: { $ifNull: ["$status", "ordered"] } },
          createdAt: { $first: "$createdAt" },
          paymentReference: { $first: "$paymentReference" },
          items: {
            $push: {
              productName: "$productName",
              quantity: "$quantity",
              totalPrice: "$totalPrice",
              imageUrl: "$imageUrl",
            },
          },
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "paymentReference",
          foreignField: "reference",
          as: "payment",
        },
      },
      {
        $addFields: {
          paymentStatus: {
            $ifNull: [{ $arrayElemAt: ["$payment.status", 0] }, "successful"],
          },
        },
      },
      { $project: { payment: 0 } },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          orders: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);
    const orders = result?.orders ?? [];
    const total = result?.total?.[0]?.count ?? 0;

    res.status(200).json({
      count: orders.length,
      pagination: createPaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
      orders: orders.map((order: Record<string, unknown>) => ({
        ...order,
        _id: order.orderId,
      })),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getAdminOrders: RequestHandler = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) {
    res.status(400).json({
      message: "page must be a positive integer and limit must be between 1 and 100",
    });
    return;
  }

  try {
    const [orders, total] = await Promise.all([
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Order.countDocuments(),
    ]);

    res.status(200).json({
      count: orders.length,
      pagination: createPaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
      orders: orders.map((order) => ({
        ...order,
        status: order.status ?? "ordered",
      })),
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ message: "Failed to fetch store orders" });
  }
};

export const updateOrderStatus: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const { id } = req.params;
  const nextStatus = req.body?.status;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid order ID" });
    return;
  }
  if (
    typeof nextStatus !== "string" ||
    !ORDER_STATUSES.some((status) => status === nextStatus)
  ) {
    res.status(400).json({
      message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
    });
    return;
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const currentStatus = order.status ?? "ordered";
    const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
    const nextIndex = ORDER_STATUSES.indexOf(
      nextStatus as (typeof ORDER_STATUSES)[number]
    );
    if (nextIndex !== currentIndex + 1) {
      res.status(409).json({
        message: `Order status can only move forward one step from ${currentStatus}.`,
      });
      return;
    }

    if (order.paymentReference) {
      const relatedOrders = await Order.find({
        paymentReference: order.paymentReference,
      });
      if (relatedOrders.some((item) => (item.status ?? "ordered") !== currentStatus)) {
        res.status(409).json({
          message: "Items in this checkout have different fulfillment statuses.",
        });
        return;
      }
      await Order.updateMany(
        { paymentReference: order.paymentReference },
        { $set: { status: ORDER_STATUSES[nextIndex] } }
      );
    } else {
      order.status = ORDER_STATUSES[nextIndex];
      await order.save();
    }
    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
