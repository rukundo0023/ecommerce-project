import mongoose, { Document, Schema } from "mongoose";

export const ORDER_STATUSES = [
  "ordered",
  "confirmed",
  "shipped",
  "delivered",
] as const;

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productName: string;
  category?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  deliveryAddress?: string;
  checkoutReference?: string;
  paymentStatus?: "pending" | "successful";
  status: (typeof ORDER_STATUSES)[number];
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Order quantity must be a whole number",
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    checkoutReference: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful"],
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "ordered",
      required: true,
    },
    paymentReference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1, _id: -1 });
orderSchema.index(
  { paymentReference: 1, product: 1 },
  { unique: true, partialFilterExpression: { paymentReference: { $type: "string" } } }
);
orderSchema.index(
  { checkoutReference: 1, product: 1 },
  { unique: true, partialFilterExpression: { checkoutReference: { $type: "string" } } }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
