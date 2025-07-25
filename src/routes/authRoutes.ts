import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} from '../middleware/validation';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validateUpdateProfile, updateProfile);

export default router; 