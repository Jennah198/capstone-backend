import express from 'express'
import { deleteOrder, getAllOrders, getDashboardStats, updateEventPublishStatus, updateOrderStatus } from '../controllers/admin.controller.js'
import { protect } from '../middlewares/authMiddleware.js'


const router = express.Router()


router.get('/admin-dashboard-stats',protect, getDashboardStats)
router.put('/update-publish-status/:eventId',protect, updateEventPublishStatus)
router.get('/get-orders',protect, getAllOrders)
router.delete('/delete-order/:id',protect, deleteOrder)
router.put('/update-order-status/:id',protect, updateOrderStatus)


export default router