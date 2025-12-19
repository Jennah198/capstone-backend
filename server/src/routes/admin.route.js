import express from 'express'
import { deleteOrder, getAllOrders, getDashboardStats, updateEventPublishStatus, updateOrderStatus } from '../controllers/admin.controller.js'
import { protect } from '../middlewares/authMiddleware.js'
import { authorize } from '../middlewares/roleCheckMiddleware.js'


const router = express.Router()


router.get('/admin-dashboard-stats',protect, authorize("admin"), getDashboardStats)
router.put('/update-publish-status/:eventId',protect, authorize("admin"), updateEventPublishStatus)
router.get('/get-orders',protect, authorize("admin"), getAllOrders)
router.delete('/delete-order/:id',protect, authorize("admin"), deleteOrder)
router.put('/update-order-status/:id',protect, authorize("admin"), updateOrderStatus)


export default router