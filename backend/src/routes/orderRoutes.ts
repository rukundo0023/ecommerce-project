import { Router } from "express";
import { getMyOrders } from "../controllers/orderController";
import { requireAuth } from "../middleware/requireAuth";

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

export default router;
