import { Router } from "express";
import {
  createPayment,
  getPaymentStatus,
} from "../controllers/paymentController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/payments/mtn:
 *   post:
 *     summary: Start an MTN MoMo payment for the authenticated customer's cart
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reference, payerPhone, items]
 *             properties:
 *               reference:
 *                 type: string
 *                 format: uuid
 *               payerPhone:
 *                 type: string
 *                 example: "0781234567"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       202:
 *         description: Payment request sent; approve it on the customer's phone
 *       400:
 *         description: Invalid phone number, cart, or RWF total
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Insufficient stock
 *       503:
 *         description: MTN MoMo is not configured
 */
router.post("/mtn", createPayment);

/**
 * @openapi
 * /api/payments/{reference}/status:
 *   get:
 *     summary: Verify an MTN MoMo payment and create orders after confirmation
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current payment status
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Payment not found
 */
router.get("/:reference/status", getPaymentStatus);

export default router;
