import { RequestHandler } from "express";
import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/order";
import Product from "../models/product";
import User from "../models/user";
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
          _id: {
            $ifNull: [
              "$paymentReference",
              { $ifNull: ["$checkoutReference", { $toString: "$_id" }] },
            ],
          },
          orderId: { $first: "$_id" },
          orderNumber: {
            $first: {
              $ifNull: [
                "$paymentReference",
                { $ifNull: ["$checkoutReference", { $toString: "$_id" }] },
              ],
            },
          },
          product: { $first: "$product" },
          productName: { $first: "$productName" },
          category: { $first: "$category" },
          description: { $first: "$description" },
          unitPrice: { $first: "$unitPrice" },
          imageUrl: { $first: "$imageUrl" },
          deliveryAddress: { $first: "$deliveryAddress" },
          checkoutReference: { $first: "$checkoutReference" },
          orderPaymentStatus: { $first: "$paymentStatus" },
          quantity: { $sum: "$quantity" },
          totalPrice: { $sum: "$totalPrice" },
          status: { $first: { $ifNull: ["$status", "ordered"] } },
          createdAt: { $first: "$createdAt" },
          paymentReference: { $first: "$paymentReference" },
          items: {
            $push: {
              productName: "$productName",
              category: "$category",
              description: "$description",
              product: "$product",
              quantity: "$quantity",
              unitPrice: "$unitPrice",
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
            $ifNull: [
              { $arrayElemAt: ["$payment.status", 0] },
              { $ifNull: ["$orderPaymentStatus", "successful"] },
            ],
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
        paymentStatus: order.paymentStatus ?? "successful",
      })),
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ message: "Failed to fetch store orders" });
  }
};

type PlaceOrderItem = {
  productId?: unknown;
  quantity?: unknown;
};

type PlaceOrderBody = {
  checkoutReference?: unknown;
  deliveryAddress?: unknown;
  items?: unknown;
};

export const placeCustomerOrder: RequestHandler = async (req, res) => {
  if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const body =
    typeof req.body === "object" && req.body !== null
      ? (req.body as PlaceOrderBody)
      : {};
  const checkoutReference = body.checkoutReference;
  const deliveryAddress =
    typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
  const rawItems = body.items;
  if (
    typeof checkoutReference !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(checkoutReference) ||
    !deliveryAddress ||
    deliveryAddress.length > 300 ||
    !Array.isArray(rawItems) ||
    rawItems.length < 1 ||
    rawItems.length > 50
  ) {
    res.status(400).json({
      message: "Provide a valid checkout reference, delivery address, and between 1 and 50 items.",
    });
    return;
  }

  const items: Array<{ productId: string; quantity: number }> = [];
  const seenProductIds = new Set<string>();
  for (const rawItem of rawItems) {
    if (typeof rawItem !== "object" || rawItem === null) {
      res.status(400).json({ message: "Invalid cart item." });
      return;
    }
    const item = rawItem as PlaceOrderItem;
    if (
      typeof item.productId !== "string" ||
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      seenProductIds.has(item.productId)
    ) {
      res.status(400).json({ message: "Invalid or duplicate cart item." });
      return;
    }
    seenProductIds.add(item.productId);
    items.push({ productId: item.productId, quantity: item.quantity });
  }

  const reserved: Array<{ productId: string; quantity: number }> = [];
  const releaseReservedStock = async () => {
    while (reserved.length > 0) {
      const reservation = reserved[0];
      await Product.updateOne(
        { _id: reservation.productId },
        { $inc: { quantity: reservation.quantity } }
      );
      reserved.shift();
    }
  };
  try {
    const user = await User.findById(req.userId).select("_id role");
    if (!user) {
      res.status(401).json({ message: "Authenticated user no longer exists" });
      return;
    }
    if (user.role !== "user") {
      res.status(403).json({ message: "Only customer accounts can place orders." });
      return;
    }

    const existingOrders = await Order.find({
      checkoutReference,
      user: user._id,
    }).lean();
    if (existingOrders.length) {
      if (
        existingOrders.length !== items.length ||
        items.some((item) =>
          !existingOrders.some(
            (order) =>
              order.product.toString() === item.productId &&
              order.quantity === item.quantity
          )
        ) ||
        existingOrders.some((order) => order.deliveryAddress !== deliveryAddress)
      ) {
        res.status(409).json({ message: "This checkout reference was already used for a different order." });
        return;
      }
      res.status(200).json({
        message: "Your order is already placed and payment is pending.",
        orderNumber: checkoutReference,
        orders: existingOrders,
      });
      return;
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== items.length) {
      res.status(404).json({ message: "One or more products were not found." });
      return;
    }
    const productsById = new Map(products.map((product) => [product.id, product]));
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) {
        res.status(404).json({ message: "One or more products were not found." });
        return;
      }
      const lineTotal = product.price * item.quantity;
      if (!Number.isFinite(lineTotal) || lineTotal > Number.MAX_SAFE_INTEGER) {
        res.status(400).json({ message: `The total for ${product.name} is too large to place as an order.` });
        return;
      }
    }
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) {
        res.status(404).json({ message: "One or more products were not found." });
        return;
      }
      const reservedProduct = await Product.findOneAndUpdate(
        { _id: product._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
      if (!reservedProduct) {
        await releaseReservedStock();
        res.status(409).json({ message: `Insufficient stock for ${product.name}.` });
        return;
      }
      reserved.push(item);
    }

    const orderDocuments = items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error("A requested product could not be loaded.");
      return {
        user: user._id,
        product: product._id,
        productName: product.name,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
        deliveryAddress,
        checkoutReference,
        paymentStatus: "pending" as const,
        status: "ordered" as const,
      };
    });
    const orders = await Order.insertMany(orderDocuments);
    res.status(201).json({
      message: "Your order is placed. Payment is pending.",
      orderNumber: checkoutReference,
      orders,
    });
  } catch (error) {
    const isDuplicateOrder =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000;
    if (isDuplicateOrder) {
      const existingOrders = await Order.find({
        checkoutReference,
        user: req.userId,
      }).lean();
      if (
        existingOrders.length === items.length &&
        items.every((item) =>
          existingOrders.some(
            (order) =>
              order.product.toString() === item.productId &&
              order.quantity === item.quantity &&
              order.deliveryAddress === deliveryAddress
          )
        )
      ) {
        await releaseReservedStock();
        res.status(200).json({
          message: "Your order is already placed and payment is pending.",
          orderNumber: checkoutReference,
          orders: existingOrders,
        });
        return;
      }
    }
    if (reserved.length) {
      try {
        await Order.deleteMany({ checkoutReference, user: req.userId });
        await releaseReservedStock();
      } catch (rollbackError) {
        console.error("Failed to roll back a pending order:", rollbackError);
      }
    }
    console.error("Place customer order error:", error);
    res.status(500).json({ message: "Unable to place the order. Please try again." });
  }
};

type UpdateCustomerOrderBody = {
  deliveryAddress?: unknown;
  items?: unknown;
};

const isEditableCustomerOrder = async (
  order: InstanceType<typeof Order>,
  userId: string
) => {
  if (
    order.user.toString() !== userId ||
    order.status !== "ordered" ||
    order.paymentStatus !== "pending" ||
    !order.checkoutReference ||
    order.paymentReference
  ) {
    return false;
  }
  const relatedOrders = await Order.find({
    checkoutReference: order.checkoutReference,
    user: userId,
  }).select("status paymentStatus paymentReference");
  return relatedOrders.length > 0 && relatedOrders.every(
    (item) =>
      item.status === "ordered" &&
      item.paymentStatus === "pending" &&
      !item.paymentReference
  );
};

export const updateCustomerOrder: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !req.userId) {
    res.status(400).json({ message: "Invalid order ID." });
    return;
  }
  const body =
    typeof req.body === "object" && req.body !== null
      ? (req.body as UpdateCustomerOrderBody)
      : {};
  const deliveryAddress =
    typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
  if (!deliveryAddress || deliveryAddress.length > 300 || !Array.isArray(body.items)) {
    res.status(400).json({
      message: "Provide a delivery address and valid order items.",
    });
    return;
  }

  const requestedItems: Array<{ productId: string; quantity: number }> = [];
  const seenProductIds = new Set<string>();
  for (const rawItem of body.items) {
    if (typeof rawItem !== "object" || rawItem === null) {
      res.status(400).json({ message: "Invalid order item." });
      return;
    }
    const item = rawItem as PlaceOrderItem;
    if (
      typeof item.productId !== "string" ||
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      seenProductIds.has(item.productId)
    ) {
      res.status(400).json({ message: "Each order item needs a unique product and a positive whole-number quantity." });
      return;
    }
    seenProductIds.add(item.productId);
    requestedItems.push({ productId: item.productId, quantity: item.quantity });
  }
  if (requestedItems.length < 1 || requestedItems.length > 50) {
    res.status(400).json({ message: "An order must contain between 1 and 50 items." });
    return;
  }

  const extraReserved: Array<{ productId: string; quantity: number }> = [];
  const updatedOrders: Array<{
    id: mongoose.Types.ObjectId;
    quantity: number;
    totalPrice: number;
    deliveryAddress: string;
  }> = [];
  const releaseExtraStock = async () => {
    while (extraReserved.length > 0) {
      const reservation = extraReserved[0];
      await Product.updateOne(
        { _id: reservation.productId },
        { $inc: { quantity: reservation.quantity } }
      );
      extraReserved.shift();
    }
  };
  try {
    const order = await Order.findOne({ _id: id, user: req.userId });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    if (!(await isEditableCustomerOrder(order, req.userId))) {
      res.status(409).json({
        message: "Only ordered orders with pending payment can be edited.",
      });
      return;
    }

    const currentOrders = await Order.find({
      checkoutReference: order.checkoutReference,
      user: req.userId,
    });
    if (
      currentOrders.length !== requestedItems.length ||
      currentOrders.some(
        (current) =>
          !requestedItems.some(
            (requested) => requested.productId === current.product.toString()
          )
      )
    ) {
      res.status(400).json({
        message: "You can change quantities for products in this order, but cannot add or remove products.",
      });
      return;
    }

    for (const current of currentOrders) {
      const requested = requestedItems.find(
        (item) => item.productId === current.product.toString()
      );
      if (!requested) continue;
      const difference = requested.quantity - current.quantity;
      if (difference > 0) {
        const product = await Product.findOneAndUpdate(
          { _id: current.product, quantity: { $gte: difference } },
          { $inc: { quantity: -difference } },
          { new: true }
        );
        if (!product) {
          await releaseExtraStock();
          res.status(409).json({
            message: `There is not enough stock to increase ${current.productName}.`,
          });
          return;
        }
        extraReserved.push({ productId: current.product.toString(), quantity: difference });
      }
    }

    for (const current of currentOrders) {
      const requested = requestedItems.find(
        (item) => item.productId === current.product.toString()
      );
      if (!requested) continue;
      const result = await Order.updateOne(
        {
          _id: current._id,
          user: req.userId,
          checkoutReference: order.checkoutReference,
          status: "ordered",
          paymentStatus: "pending",
          paymentReference: { $exists: false },
        },
        {
          $set: {
            quantity: requested.quantity,
            totalPrice: current.unitPrice * requested.quantity,
            deliveryAddress,
          },
        }
      );
      if (result.matchedCount !== 1) {
        for (const previous of updatedOrders) {
          await Order.updateOne(
            { _id: previous.id, user: req.userId },
            {
              $set: {
                quantity: previous.quantity,
                totalPrice: previous.totalPrice,
                deliveryAddress: previous.deliveryAddress,
              },
            }
          );
        }
        await releaseExtraStock();
        res.status(409).json({
          message: "The order changed while it was being edited. Refresh and try again.",
        });
        return;
      }
      updatedOrders.push({
        id: current._id,
        quantity: current.quantity,
        totalPrice: current.totalPrice,
        deliveryAddress: current.deliveryAddress ?? "",
      });
    }

    for (const current of currentOrders) {
      const requested = requestedItems.find(
        (item) => item.productId === current.product.toString()
      );
      if (requested && requested.quantity < current.quantity) {
        await Product.updateOne(
          { _id: current.product },
          { $inc: { quantity: current.quantity - requested.quantity } }
        );
      }
    }

    res.status(200).json({
      message: "Your order was updated.",
      orderNumber: order.checkoutReference,
    });
  } catch (error) {
    if (updatedOrders.length > 0) {
      try {
        for (const previous of updatedOrders) {
          await Order.updateOne(
            { _id: previous.id, user: req.userId },
            {
              $set: {
                quantity: previous.quantity,
                totalPrice: previous.totalPrice,
                deliveryAddress: previous.deliveryAddress,
              },
            }
          );
        }
      } catch (rollbackError) {
        console.error("Failed to restore order details after an update error:", rollbackError);
      }
    }
    if (extraReserved.length > 0) {
      try {
        await releaseExtraStock();
      } catch (rollbackError) {
        console.error("Failed to restore reserved stock after order update failed:", rollbackError);
      }
    }
    console.error("Update customer order error:", error);
    res.status(500).json({ message: "Unable to update the order. Please try again." });
  }
};

export const cancelCustomerOrder: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !req.userId) {
    res.status(400).json({ message: "Invalid order ID." });
    return;
  }
  try {
    const order = await Order.findOne({ _id: id, user: req.userId });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    if (!(await isEditableCustomerOrder(order, req.userId))) {
      res.status(409).json({
        message: "Only ordered orders with pending payment can be canceled.",
      });
      return;
    }

    const relatedOrders = await Order.find({
      checkoutReference: order.checkoutReference,
      user: req.userId,
    }).lean();
    const deletion = await Order.deleteMany({
      checkoutReference: order.checkoutReference,
      user: req.userId,
      status: "ordered",
      paymentStatus: "pending",
      paymentReference: { $exists: false },
    });
    if (deletion.deletedCount !== relatedOrders.length) {
      const remaining = await Order.find({
        _id: { $in: relatedOrders.map((item) => item._id) },
      })
        .select("_id")
        .lean();
      const remainingIds = new Set(remaining.map((item) => item._id.toString()));
      for (const removed of relatedOrders) {
        if (!remainingIds.has(removed._id.toString())) {
          await Product.updateOne(
            { _id: removed.product },
            { $inc: { quantity: removed.quantity } }
          );
        }
      }
      res.status(409).json({
        message: "The order changed while it was being canceled. Refresh and try again.",
      });
      return;
    }
    try {
      for (const item of relatedOrders) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: item.quantity } }
        );
      }
    } catch (stockError) {
      console.error("Order canceled but reserved stock could not be fully restored:", stockError);
      res.status(500).json({
        message: "The order was canceled, but inventory could not be fully restored. Contact store support.",
      });
      return;
    }
    res.status(200).json({ message: "Your order was canceled." });
  } catch (error) {
    console.error("Cancel customer order error:", error);
    res.status(500).json({ message: "Unable to cancel the order. Please try again." });
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

    const checkoutFilter = order.paymentReference
      ? { paymentReference: order.paymentReference }
      : order.checkoutReference
        ? { checkoutReference: order.checkoutReference }
        : null;
    if (checkoutFilter) {
      const relatedOrders = await Order.find(checkoutFilter);
      if (relatedOrders.some((item) => (item.status ?? "ordered") !== currentStatus)) {
        res.status(409).json({
          message: "Items in this checkout have different fulfillment statuses.",
        });
        return;
      }
      await Order.updateMany(
        checkoutFilter,
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
