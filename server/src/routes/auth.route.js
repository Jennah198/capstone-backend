// src/routes/authRoutes.ts

import { Router } from 'express';
import { changeUserRole, getAllUsers, login, register } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();


router.post('/register', register);
router.post('/login', login);

router.post('/change-role/:id',protect, changeUserRole); // FOR ADMIN ONLY
router.get('/get-all-users', protect, getAllUsers);  // FOR ADMIN ONLY

export default router;
