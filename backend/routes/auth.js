import express from 'express';
import { registerUser, loginUser, registerAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-admin', registerAdmin);

export default router;