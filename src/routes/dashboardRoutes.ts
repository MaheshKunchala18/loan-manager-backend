import { Router } from 'express';
import {
  getDashboardStats,
  getMonthlyLoanMetrics,
  getRecentLoans,
  getUserDashboard
} from '../controllers/dashboardController';
import { authenticate, userAuth, verifierAuth } from '../middleware/auth';

const router = Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Verifier, Admin)
router.get('/stats', verifierAuth, getDashboardStats);

// @route   GET /api/dashboard/metrics
// @desc    Get monthly loan metrics for charts
// @access  Private (Verifier, Admin)
router.get('/metrics', verifierAuth, getMonthlyLoanMetrics);

// @route   GET /api/dashboard/recent-loans
// @desc    Get recent loan applications
// @access  Private (Verifier, Admin)
router.get('/recent-loans', verifierAuth, getRecentLoans);

// @route   GET /api/dashboard/user
// @desc    Get user-specific dashboard data
// @access  Private (User, Verifier, Admin)
router.get('/user', userAuth, getUserDashboard);

export default router; 