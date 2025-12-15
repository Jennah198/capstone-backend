import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createVenue, deleteVenue, getVenue, getVenueById, updateVenue } from '../controllers/venue.controller.js';
import upload from '../middlewares/uploadMiddleware.js';



const router = express.Router();

router.post('/create-venue', upload.single("image"), createVenue);
router.get('/get-venue', getVenue);
router.get('/get-single-venue/:id', getVenueById);
router.delete('/delete-venue/:id', deleteVenue);
router.put('/update-venue/:id', upload.single("image"), updateVenue);


export default router;