import express from 'express';

import { createEvent, deleteEvent, getAllEvents, getEventById, getEventsByCategory, getEventsByVenue, updateEvent } from '../controllers/event.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/create-event',protect, upload.single("image"), createEvent);
router.delete('/delete-event/:id',protect, deleteEvent);
router.put('/update-event/:id',protect, upload.single("image"), updateEvent);
router.get('/get-all-events',protect, getAllEvents);
router.get('/get-eventById/:id', protect, getEventById);

router.get('/get-eventByCategory/:categoryId', protect, getEventsByCategory);
router.get('/get-event-by-venue/:venueId', protect, getEventsByVenue);

export default router;