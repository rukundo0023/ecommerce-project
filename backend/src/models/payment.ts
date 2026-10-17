import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface IPayment extends Document {
  reference: string;
  user: mongoose.Types.ObjectId;
  payerPhone: string;
  currency: string;
  amount: number;
  status: "initiating" | "pending" | "successful" | "failed";
  providerStatus?: string;
  items: IPaymentItem[];
}

const paymentItemSchema = new Schema<IPaymentItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const paymentSchema = new Schema<IPayment>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payerPhone: { type: String, required: true },
    currency: { type: String, required: true, enum: ["RWF"] },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ["initiating", "pending", "successful", "failed"],
      default: "initiating",
    },
    providerStatus: { type: String },
    items: { type: [paymentItemSchema], required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
