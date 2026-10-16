import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminController";
import { requireAdmin, requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: Get store analytics and recent payments (administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory, payment, revenue, and recent payment summary
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 */
router.get("/dashboard", requireAuth, requireAdmin, getAdminDashboard);

export default router;
