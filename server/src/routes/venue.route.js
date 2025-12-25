import express from "express";
import {
  createVenue,
  deleteVenue,
  getVenue,
  getVenueById,
  updateVenue,
} from "../controllers/venue.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Venues
 *   description: Venue management
 */

/**
 * @swagger
 * /venues/create-venue:
 *   post:
 *     summary: Create a new venue
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Venue created
 */
router.post(
  "/create-venue",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  createVenue
);

/**
 * @swagger
 * /venues/get-venue:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of venues
 */
router.get("/get-venue", protect, getVenue);

/**
 * @swagger
 * /venues/get-single-venue/{id}:
 *   get:
 *     summary: Get a single venue
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue details
 */
router.get("/get-single-venue/:id", protect, getVenueById);

/**
 * @swagger
 * /venues/delete-venue/{id}:
 *   delete:
 *     summary: Delete a venue
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue deleted
 */
router.delete(
  "/delete-venue/:id",
  protect,
  authorize("organizer", "admin"),
  deleteVenue
);

/**
 * @swagger
 * /venues/update-venue/{id}:
 *   put:
 *     summary: Update a venue
 *     tags: [Venues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Venue ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Venue updated
 */
router.put(
  "/update-venue/:id",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  updateVenue
);

export default router;
