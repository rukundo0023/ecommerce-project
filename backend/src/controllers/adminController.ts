import { RequestHandler } from "express";
import Order from "../models/order";
import Payment from "../models/payment";
import Product from "../models/product";

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
        status: { $in: ["successful", "initiating", "pending"] },
      })
        .select("reference user amount currency status items createdAt")
        .populate("user", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .limit(8)
        .lean(),
    ]);

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
      },
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
