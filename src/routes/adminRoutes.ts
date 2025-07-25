import { Router } from 'express';
import {
  getAllUsers,
  createAdmin,
  createVerifier,
  updateUser,
  deleteUser,
  getSystemStats
} from '../controllers/adminController';
import { adminAuth } from '../middleware/auth';
import {
  validateCreateAdmin,
  validateUpdateUser,
  validateUserId,
  validatePagination
} from '../middleware/validation';

const router = Router();

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', adminAuth, validatePagination, getAllUsers);

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private (Admin only)
router.post('/create-admin', adminAuth, validateCreateAdmin, createAdmin);

// @route   POST /api/admin/create-verifier
// @desc    Create new verifier user
// @access  Private (Admin only)
router.post('/create-verifier', adminAuth, validateCreateAdmin, createVerifier);

// @route   PUT /api/admin/users/:userId
// @desc    Update user role or status
// @access  Private (Admin only)
router.put('/users/:userId', adminAuth, validateUserId, validateUpdateUser, updateUser);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete (deactivate) user
// @access  Private (Admin only)
router.delete('/users/:userId', adminAuth, validateUserId, deleteUser);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, getSystemStats);

export default router; 