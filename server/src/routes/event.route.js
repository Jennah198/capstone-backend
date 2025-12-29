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

router.post(
  "/create-event",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  createEvent
);
router.delete(
  "/delete-event/:id",
  protect,
  authorize("organizer", "admin"),
  deleteEvent
);
router.put("/update-event/:id", protect, upload.single("image"), updateEvent);
router.get("/get-all-events", getAllEvents);
router.get("/get-eventById/:id", getEventById);

router.get("/get-eventByCategory/:categoryId", getEventsByCategory);
router.get("/get-event-by-venue/:venueId", getEventsByVenue);

export default router;
