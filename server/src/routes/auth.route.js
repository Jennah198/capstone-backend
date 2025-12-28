// src/routes/authRoutes.ts

import { Router } from 'express';
import { changeUserRole, getAllUsers, getUserProfile, login, logout, register } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleCheckMiddleware.js';

const router = Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.put('/change-role/:id', protect, authorize("admin"), changeUserRole); // FOR ADMIN ONLY
router.get('/get-users', protect, authorize("admin"), getAllUsers);  // FOR ADMIN ONLY
router.get('/user-profile', protect, getUserProfile);

export default router;
