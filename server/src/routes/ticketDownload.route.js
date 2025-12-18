import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { downloadOrderTickets, downloadTicket } from "../controllers/ticketDownload.controller.js";


const router = express.Router();


router.get('/:ticketId/download',protect, downloadTicket);
router.get('/download-tickets/:orderId',protect, downloadOrderTickets);


export default router
