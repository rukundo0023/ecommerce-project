import { RequestHandler } from "express";
import mongoose from "mongoose";
import Order from "../models/order";
import Payment, { IPaymentItem } from "../models/payment";
import Product from "../models/product";
import User from "../models/user";
import { sendOrderConfirmationEmail } from "../services/emailService";
import {
  assertMomoConfiguration,
  getRequestToPayStatus,
  isDefinitiveMomoRejection,
  requestToPay,
} from "../services/mtnMomo";

type PaymentItemInput = {
  productId?: unknown;
  quantity?: unknown;
};

type CreatePaymentBody = {
  reference?: unknown;
  payerPhone?: unknown;
  items?: unknown;
};

const normalizeRwandaPhoneNumber = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `250${digits.slice(1)}`
    : digits;
  return /^2507\d{8}$/.test(normalized) ? normalized : null;
};

const releaseReservedStock = async (
  items: IPaymentItem[]
): Promise<void> => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { quantity: item.quantity } }
    );
  }
};

const createPaidOrders = async (payment: {
  reference: string;
  user: mongoose.Types.ObjectId;
  items: IPaymentItem[];
}): Promise<void> => {
  const user = await User.findById(payment.user).select("name email");
  if (!user) {
    throw new Error("The customer for this payment no longer exists.");
  }

  for (const item of payment.items) {
    let result;
    try {
      result = await Order.updateOne(
        { paymentReference: payment.reference, product: item.product },
        {
          $setOnInsert: {
            user: payment.user,
            product: item.product,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            paymentReference: payment.reference,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== 11000
      ) {
        throw error;
      }
    }

    if (result?.upsertedCount) {
      const order = await Order.findOne({
        paymentReference: payment.reference,
        product: item.product,
      });
      if (!order) {
        throw new Error("A paid order could not be retrieved after creation.");
      }

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
        const message =
          emailError instanceof Error ? emailError.message : "Unknown error";
        console.error(`Order confirmation email delivery failed: ${message}`);
      }
    }
  }
};

export const createPayment: RequestHandler = async (req, res) => {
  if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const body =
    typeof req.body === "object" && req.body !== null
      ? (req.body as CreatePaymentBody)
      : {};
  const reference = body.reference;
  const payerPhone =
    typeof body.payerPhone === "string"
      ? normalizeRwandaPhoneNumber(body.payerPhone)
      : null;
  const rawItems = body.items;
  if (
    typeof reference !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      reference
    ) ||
    !payerPhone ||
    !Array.isArray(rawItems) ||
    rawItems.length < 1 ||
    rawItems.length > 50
  ) {
    res.status(400).json({
      message:
        "Provide a valid Rwanda MTN phone number and between 1 and 50 cart items.",
    });
    return;
  }

  const itemsInput: { productId: string; quantity: number }[] = [];
  const seenProductIds = new Set<string>();
  for (const value of rawItems) {
    if (typeof value !== "object" || value === null) {
      res.status(400).json({ message: "Invalid cart item." });
      return;
    }
    const item = value as PaymentItemInput;
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
    itemsInput.push({
      productId: item.productId,
      quantity: item.quantity,
    });
  }

  try {
    const existingPayment = await Payment.findOne({ reference });
    if (existingPayment) {
      if (existingPayment.user.toString() !== req.userId) {
        res.status(409).json({ message: "Payment reference already exists." });
        return;
      }
      if (existingPayment.status === "failed") {
        res.status(409).json({
          message: "This payment attempt failed. Start a new checkout attempt.",
        });
        return;
      }
      res.status(existingPayment.status === "successful" ? 200 : 202).json({
        message:
          existingPayment.status === "successful"
            ? "Payment has already been confirmed."
            : "This payment request is already in progress.",
        reference: existingPayment.reference,
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
      });
      return;
    }
  } catch (error) {
    console.error("Find existing MTN MoMo payment error:", error);
    res.status(500).json({ message: "Failed to check the payment attempt." });
    return;
  }

  try {
    assertMomoConfiguration();
  } catch (error) {
    console.error("Ericsson Collection configuration error:", error);
    res.status(503).json({
      message: "Ericsson Collection payments are not configured on the server.",
    });
    return;
  }

  let reservedItems: IPaymentItem[] = [];
  let payment: InstanceType<typeof Payment> | undefined;
  let requestMayHaveReachedProvider = false;
  try {
    const user = await User.findById(req.userId).select("_id");
    if (!user) {
      res.status(401).json({ message: "Authenticated user no longer exists" });
      return;
    }

    const products = await Product.find({
      _id: { $in: itemsInput.map((item) => item.productId) },
    });
    if (products.length !== itemsInput.length) {
      res.status(404).json({ message: "One or more products were not found." });
      return;
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const items: IPaymentItem[] = itemsInput.map((input) => {
      const product = productById.get(input.productId);
      if (!product) {
        throw new Error("A requested product could not be loaded.");
      }
      return {
        product: product._id,
        productName: product.name,
        quantity: input.quantity,
        unitPrice: product.price,
      };
    });

    const amount = items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      res.status(400).json({
        message: "MTN MoMo checkout requires a positive whole-number RWF total.",
      });
      return;
    }

    payment = await Payment.create({
      reference,
      user: user._id,
      payerPhone,
      currency: "RWF",
      amount,
      items,
      status: "initiating",
    });

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
      if (!product) {
        await releaseReservedStock(reservedItems);
        reservedItems = [];
        await Payment.updateOne(
          { _id: payment._id },
          { $set: { status: "failed", providerStatus: "INSUFFICIENT_STOCK" } }
        );
        res.status(409).json({
          message: "Insufficient stock for one or more cart items.",
        });
        return;
      }
      reservedItems.push(item);
    }

    requestMayHaveReachedProvider = true;
    await requestToPay({
      reference,
      amount,
      currency: "RWF",
      payerPhone,
    });

    await Payment.updateOne(
      { _id: payment._id },
      { $set: { status: "pending", providerStatus: "PENDING" } }
    );
    res.status(202).json({
      message: "Approve the MTN MoMo payment prompt on your phone.",
      reference,
      status: "pending",
      amount,
      currency: "RWF",
    });
  } catch (error) {
    console.error("Create MTN MoMo payment error:", error);

    if (payment && !requestMayHaveReachedProvider) {
      try {
        await releaseReservedStock(reservedItems);
        await Payment.updateOne(
          { _id: payment._id },
          { $set: { status: "failed", providerStatus: "REQUEST_NOT_SENT" } }
        );
      } catch (releaseError) {
        console.error(
          "Failed to release stock after payment setup failed:",
          releaseError
        );
      }
      res.status(500).json({
        message: "Could not prepare the MTN MoMo payment. No order was placed.",
      });
      return;
    }

    if (payment && isDefinitiveMomoRejection(error)) {
      try {
        await releaseReservedStock(reservedItems);
        await Payment.updateOne(
          { _id: payment._id },
          { $set: { status: "failed", providerStatus: "REQUEST_REJECTED" } }
        );
      } catch (releaseError) {
        console.error(
          "Failed to release reserved stock after MTN MoMo rejection:",
          releaseError
        );
      }
      res.status(502).json({
        message: "MTN MoMo rejected the payment request. No order was placed.",
      });
      return;
    }

    if (payment && reservedItems.length > 0) {
      await Payment.updateOne(
        { _id: payment._id },
        { $set: { status: "pending", providerStatus: "PENDING" } }
      );
      res.status(202).json({
        message:
          "The payment request status is not yet confirmed. Check its status before trying again.",
        reference: payment.reference,
        status: "pending",
        amount: payment.amount,
        currency: payment.currency,
      });
      return;
    }

    if (payment) {
      await Payment.deleteOne({ _id: payment._id });
    }
    res.status(500).json({ message: "Failed to start the MTN MoMo payment." });
  }
};

export const getPaymentStatus: RequestHandler = async (req, res) => {
  if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const reference = req.params.reference;
  if (typeof reference !== "string") {
    res.status(400).json({ message: "Provide a valid payment reference." });
    return;
  }

  try {
    const payment = await Payment.findOne({
      reference,
      user: req.userId,
    });
    if (!payment) {
      res.status(404).json({ message: "Payment not found." });
      return;
    }

    if (payment.status === "initiating" || payment.status === "pending") {
      const providerStatus = await getRequestToPayStatus(payment.reference);
      if (providerStatus === "SUCCESSFUL") {
        await createPaidOrders(payment);
        payment.status = "successful";
        payment.providerStatus = providerStatus;
        await payment.save();
      } else if (providerStatus === "FAILED") {
        const failedPayment = await Payment.findOneAndUpdate(
          { _id: payment._id, status: { $in: ["initiating", "pending"] } },
          { $set: { status: "failed", providerStatus: providerStatus } },
          { new: true }
        );
        if (failedPayment) {
          await releaseReservedStock(payment.items);
        }
        payment.status = "failed";
        payment.providerStatus = providerStatus;
      } else {
        payment.status = "pending";
        payment.providerStatus = providerStatus;
        await payment.save();
      }
    }

    res.status(200).json({
      reference: payment.reference,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Get MTN MoMo payment status error:", error);
    res.status(502).json({
      message: "Could not verify the MTN MoMo payment status. Try again shortly.",
    });
  }
};
