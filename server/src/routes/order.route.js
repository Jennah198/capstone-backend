import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createOrder, getUserOrders } from "../controllers/order.controller.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";


const router = express.Router();


router.post('/create-order',protect, createOrder);
router.get('/user-orders', getUserOrders);


export default router
