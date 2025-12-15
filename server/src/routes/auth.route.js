// src/routes/authRoutes.ts

import { Router } from 'express';
import { changeUserRole, getAllUsers, login, register } from '../controllers/auth.controller.js';

const router = Router();


router.post('/register', register);
router.post('/login', login);

router.post('/change-role', changeUserRole); // FOR ADMIN ONLY
router.get('/get-all-users', getAllUsers);  // FOR ADMIN ONLY

export default router;