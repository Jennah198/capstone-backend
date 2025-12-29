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

router.post(
  "/create-venue",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  createVenue
);
router.get("/get-venue", getVenue);
router.get("/get-single-venue/:id", getVenueById);
router.delete(
  "/delete-venue/:id",
  protect,
  authorize("organizer", "admin"),
  deleteVenue
);
router.put(
  "/update-venue/:id",
  protect,
  authorize("organizer", "admin"),
  upload.single("image"),
  updateVenue
);

export default router;
