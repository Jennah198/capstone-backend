import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {chapaCallback, pay, verify } from "../controllers/payment.controller.js";






const router = express.Router();


router.post('/pay',pay);
router.get('/verify/:tx_ref',verify);
router.post("/callback/:tx_ref", chapaCallback);




export default router
