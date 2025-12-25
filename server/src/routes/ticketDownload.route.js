import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  downloadOrderTickets,
  downloadTicket,
} from "../controllers/ticketDownload.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /tickets/{ticketId}/download:
 *   get:
 *     summary: Download a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         schema:
 *           type: string
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:ticketId/download", protect, downloadTicket);

/**
 * @swagger
 * /tickets/download-tickets/{orderId}:
 *   get:
 *     summary: Download all tickets for an order
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Tickets PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/download-tickets/:orderId", protect, downloadOrderTickets);

export default router;
