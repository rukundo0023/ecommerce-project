import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

import { requireAdmin, requireAuth } from "../middleware/requireAuth";
import upload from "../middleware/upload";

const router = Router();

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a product (administrator only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Electronics, Fashion, Home & Kitchen, Beauty & Personal Care]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid product details
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 */
router.post("/", requireAuth, requireAdmin, upload, createProduct);

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get a paginated list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Electronics, Fashion, Home & Kitchen, Beauty & Personal Care]
 *     responses:
 *       200:
 *         description: Paginated product list
 *       400:
 *         description: Invalid pagination parameters
 */
router.get("/", getProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (administrator only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Electronics, Fashion, Home & Kitchen, Beauty & Personal Care]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 */
router.put("/:id", requireAuth, requireAdmin, upload, updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Partially update a product (administrator only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Electronics, Fashion, Home & Kitchen, Beauty & Personal Care]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid product details
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Product not found
 */
router.patch("/:id", requireAuth, requireAdmin, upload, updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (administrator only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 */
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;