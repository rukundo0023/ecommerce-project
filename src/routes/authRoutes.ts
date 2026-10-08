import { Router } from "express";
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register an account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       201:
 *         description: Account created and authenticated
 *       400:
 *         description: Invalid registration details
 *       409:
 *         description: Email is already registered
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in to an account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset instructions
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Generic response whether or not the account exists
 *       400:
 *         description: Invalid email address
 */
router.post("/forgot-password", requestPasswordReset);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Set a new password using a reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: The one-time token received in the reset link
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid, expired, or already-used reset token
 */
router.post("/reset-password", resetPassword);

export default router;
