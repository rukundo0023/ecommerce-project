import mongoose, { Document, Schema } from "mongoose";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
] as const;

export interface IProduct extends Document {
  name: string;
  category: (typeof PRODUCT_CATEGORIES)[number];
  price: number;
  description: string;
  quantity: number;
  imageUrl?: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      default: "Electronics",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ createdAt: -1, _id: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;