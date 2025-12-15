import express from 'express';

import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from '../controllers/event.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/create-event', upload.single("image"), createEvent);
router.delete('/delete-event/:id',protect, deleteEvent);
router.put('/update-event/:id', upload.single("image"), updateEvent);
router.get('/get-all-events', protect, getAllEvents);
router.get('/get-eventById/:id', protect, getEventById);

export default router;