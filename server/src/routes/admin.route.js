import express from "express";
import {
  deleteOrder,
  getAllOrders,
  getDashboardStats,
  updateEventPublishStatus,
  updateOrderStatus,
} from "../controllers/admin.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin/admin-dashboard-stats:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get(
  "/admin-dashboard-stats",
  protect,
  authorize("admin"),
  getDashboardStats
);

/**
 * @swagger
 * /admin/update-publish-status/{eventId}:
 *   put:
 *     summary: Update event publish status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put(
  "/update-publish-status/:eventId",
  protect,
  authorize("admin"),
  updateEventPublishStatus
);

/**
 * @swagger
 * /admin/get-orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/get-orders", protect, authorize("admin"), getAllOrders);

/**
 * @swagger
 * /admin/delete-order/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted
 */
router.delete("/delete-order/:id", protect, authorize("admin"), deleteOrder);

/**
 * @swagger
 * /admin/update-order-status/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put(
  "/update-order-status/:id",
  protect,
  authorize("admin"),
  updateOrderStatus
);

export default router;
