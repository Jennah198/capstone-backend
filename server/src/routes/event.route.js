import express from "express";

import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByCategory,
  getEventsByVenue,
  updateEvent,
} from "../controllers/event.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

/**
 * @swagger
 * /events/create-event:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               category:
 *                 type: string
 *               venue:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created
 */
router.post(
  "/create-event",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  createEvent
);

/**
 * @swagger
 * /events/delete-event/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete(
  "/delete-event/:id",
  protect,
  authorize("organizer", "admin"),
  deleteEvent
);

/**
 * @swagger
 * /events/update-event/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put("/update-event/:id", protect, upload.single("image"), updateEvent);

/**
 * @swagger
 * /events/get-all-events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/get-all-events", protect, getAllEvents);

/**
 * @swagger
 * /events/get-eventById/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 */
router.get("/get-eventById/:id", protect, getEventById);

/**
 * @swagger
 * /events/get-eventByCategory/{categoryId}:
 *   get:
 *     summary: Get events by category
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/get-eventByCategory/:categoryId", protect, getEventsByCategory);

/**
 * @swagger
 * /events/get-event-by-venue/{venueId}:
 *   get:
 *     summary: Get events by venue
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venueId
 *         schema:
 *           type: string
 *         required: true
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/get-event-by-venue/:venueId", protect, getEventsByVenue);

export default router;
