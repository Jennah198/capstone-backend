import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder, getUserOrders } from "../controllers/order.controller.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/create-order:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - quantity
 *               - ticketType
 *             properties:
 *               eventId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               ticketType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/create-order", protect, createOrder);

/**
 * @swagger
 * /orders/user-orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get("/user-orders", getUserOrders);

export default router;
