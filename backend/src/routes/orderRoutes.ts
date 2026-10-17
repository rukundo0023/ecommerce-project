import { Router } from "express";
import {
  getAdminOrders,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { requireAdmin, requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

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

/**
 * @openapi
 * /api/orders/admin:
 *   get:
 *     summary: Get a paginated store order list (administrator only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store orders with customer information and fulfillment status
 *       403:
 *         description: Administrator access required
 */
router.get("/admin", requireAdmin, getAdminOrders);

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Advance an order fulfillment status (administrator only)
 *     tags: [Orders]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ordered, confirmed, shipped, delivered]
 *     responses:
 *       200:
 *         description: Order fulfillment status updated
 *       403:
 *         description: Administrator access required
 *       409:
 *         description: Invalid status transition
 */
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;
