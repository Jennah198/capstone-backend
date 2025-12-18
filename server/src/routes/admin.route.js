import express from 'express'
import { getDashboardStats, updateEventPublishStatus } from '../controllers/admin.controller.js'
import { protect } from '../middlewares/authMiddleware.js'


const router = express.Router()


router.get('/admin-dashboard-stats',protect, getDashboardStats)
router.put('/update-publish-status/:eventId',protect, updateEventPublishStatus)


export default router