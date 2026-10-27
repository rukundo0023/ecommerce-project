import { RequestHandler } from "express";
import Order from "../models/order";
import Payment from "../models/payment";
import Product from "../models/product";
import User from "../models/user";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 5;

export const getAdminDashboard: RequestHandler = async (_req, res) => {
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const currentPeriodStart = new Date(
    todayUtc.getTime() - 6 * DAY_IN_MILLISECONDS
  );
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - 7 * DAY_IN_MILLISECONDS
  );
  const tomorrowUtc = new Date(todayUtc.getTime() + DAY_IN_MILLISECONDS);

  try {
    const [
      inventoryResult,
      bestSellers,
      paymentTotalsResult,
      paymentStatuses,
      dailyPayments,
      recentPayments,
      orderMetricsResult,
      recentOrders,
      categoryCounts,
      lowStockProducts,
      totalCustomers,
    ] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            unitsInStock: { $sum: "$quantity" },
            outOfStock: {
              $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$quantity", 0] },
                      { $lte: ["$quantity", LOW_STOCK_THRESHOLD] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$productName",
            unitsSold: { $sum: "$quantity" },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { unitsSold: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Payment.aggregate([
        { $match: { status: "successful" } },
        {
          $group: {
            _id: null,
            successfulPayments: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: "successful",
            createdAt: {
              $gte: previousPeriodStart,
              $lt: tomorrowUtc,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            checkouts: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      Payment.find({
        status: { $in: ["successful", "initiating", "pending", "failed"] },
      })
        .select("reference user amount currency status items createdAt")
        .populate("user", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .limit(8)
        .lean(),
      Order.aggregate([
        {
          $group: {
            _id: {
              $ifNull: [
                "$paymentReference",
                { $ifNull: ["$checkoutReference", { $toString: "$_id" }] },
              ],
            },
            status: { $first: { $ifNull: ["$status", "ordered"] } },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            awaitingDelivery: {
              $sum: { $cond: [{ $ne: ["$status", "delivered"] }, 1, 0] },
            },
          },
        },
      ]),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .limit(100)
        .lean(),
      Product.aggregate([
        { $group: { _id: { $ifNull: ["$category", "Electronics"] }, count: { $sum: 1 } } },
      ]),
      Product.find({ quantity: { $lte: LOW_STOCK_THRESHOLD } })
        .select("name category quantity imageUrl")
        .sort({ quantity: 1, name: 1 })
        .limit(8)
        .lean(),
      User.countDocuments({ role: "user" }),
    ]);
    const orderPayments = await Payment.find({
      reference: {
        $in: recentOrders
          .map((order) => order.paymentReference)
          .filter((reference): reference is string => Boolean(reference)),
      },
    })
      .select("reference status")
      .lean();
    const paymentStatusByReference = new Map(
      orderPayments.map((payment) => [payment.reference, payment.status])
    );
    const orderGroups = new Map<string, typeof recentOrders>();
    for (const order of recentOrders) {
      const reference =
        order.paymentReference ??
        order.checkoutReference ??
        order._id.toString();
      const group = orderGroups.get(reference) ?? [];
      group.push(order);
      orderGroups.set(reference, group);
    }
    const groupedRecentOrders = Array.from(orderGroups.entries()).slice(0, 8).map(
      ([reference, items]) => {
        const firstOrder = items[0];
        return {
          _id: firstOrder._id,
          orderNumber: reference,
          user: firstOrder.user,
          productName: items.map((item) => item.productName).join(", "),
          deliveryAddress: firstOrder.deliveryAddress,
          imageUrl: firstOrder.imageUrl,
          quantity: items.reduce((total, item) => total + item.quantity, 0),
          amount: items.reduce((total, item) => total + item.totalPrice, 0),
          paymentStatus:
            paymentStatusByReference.get(reference) ??
            firstOrder.paymentStatus ??
            "successful",
          status: firstOrder.status ?? "ordered",
          createdAt: firstOrder.createdAt,
        };
      }
    );

    const inventory = inventoryResult[0] ?? {
      totalProducts: 0,
      unitsInStock: 0,
      outOfStock: 0,
      lowStock: 0,
    };
    const paymentTotals = paymentTotalsResult[0] ?? {
      successfulPayments: 0,
      revenue: 0,
    };
    const statuses = Object.fromEntries(
      paymentStatuses.map(({ _id, count }) => [_id, count])
    ) as Record<string, number>;
    const salesByDate = new Map(
      dailyPayments.map(({ _id, checkouts, revenue }) => [
        _id,
        { checkouts, revenue },
      ])
    );
    const salesByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(
        currentPeriodStart.getTime() + index * DAY_IN_MILLISECONDS
      );
      const key = date.toISOString().slice(0, 10);
      const sales = salesByDate.get(key);
      return {
        date: key,
        checkouts: sales?.checkouts ?? 0,
        revenue: sales?.revenue ?? 0,
      };
    });
    const previousPeriodRevenue = dailyPayments.reduce(
      (total, payment) =>
        payment._id < currentPeriodStart.toISOString().slice(0, 10)
          ? total + payment.revenue
          : total,
      0
    );

    res.status(200).json({
      generatedAt: now.toISOString(),
      inventory: {
        totalProducts: inventory.totalProducts,
        unitsInStock: inventory.unitsInStock,
        lowStock: inventory.lowStock,
        outOfStock: inventory.outOfStock,
        categories: categoryCounts.map(({ _id, count }) => ({
          category: _id,
          count,
        })),
        lowStockProducts,
      },
      customers: { total: totalCustomers },
      bestSellers: bestSellers.map(({ _id, unitsSold, revenue }) => ({
        productName: _id,
        unitsSold,
        revenue,
      })),
      payments: {
        successful: paymentTotals.successfulPayments,
        pending: (statuses.initiating ?? 0) + (statuses.pending ?? 0),
        failed: statuses.failed ?? 0,
      },
      orders: {
        total: orderMetricsResult[0]?.total ?? 0,
        awaitingDelivery: orderMetricsResult[0]?.awaitingDelivery ?? 0,
      },
      recentOrders: groupedRecentOrders,
      revenue: {
        total: paymentTotals.revenue,
        last7Days: salesByDay.reduce((total, day) => total + day.revenue, 0),
        previous7Days: previousPeriodRevenue,
      },
      salesByDay,
      recentPayments,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};
