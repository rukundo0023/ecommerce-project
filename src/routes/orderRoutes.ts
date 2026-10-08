import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Place an order for a product
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Order placed
 *       400:
 *         description: Invalid order details
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Insufficient stock
 */
router.post("/", createOrder);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get a paginated list of the authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Paginated list of the user's orders
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Authentication required
 */
router.get("/", getMyOrders);

export default router;
