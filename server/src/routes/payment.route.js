import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  chapaCallback,
  pay,
  verify,
} from "../controllers/payment.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management
 */

/**
 * @swagger
 * /payment/pay:
 *   post:
 *     summary: Initialize payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - first_name
 *               - last_name
 *               - email
 *               - phone_number
 *             properties:
 *               orderId:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkout_url:
 *                   type: string
 *                 tx_ref:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/pay", pay);

/**
 * @swagger
 * /payment/verify/{tx_ref}:
 *   get:
 *     summary: Verify payment
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: tx_ref
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction reference
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Payment failed
 */
router.get("/verify/:tx_ref", verify);

/**
 * @swagger
 * /payment/callback/{tx_ref}:
 *   post:
 *     summary: Payment callback
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: tx_ref
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction reference
 *     responses:
 *       200:
 *         description: Callback processed
 */
router.post("/callback/:tx_ref", chapaCallback);

export default router;
