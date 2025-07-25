import { Router } from 'express';
import {
  createLoanApplication,
  getUserLoanApplications,
  getAllLoanApplications,
  verifyLoanApplication,
  approveLoanApplication,
  getLoanApplicationById
} from '../controllers/loanController';
import { authenticate, userAuth, verifierAuth, adminAuth } from '../middleware/auth';
import {
  validateLoanApplication,
  validateLoanAction,
  validateObjectId,
  validatePagination
} from '../middleware/validation';

const router = Router();

// @route   POST /api/loans
// @desc    Create new loan application
// @access  Private (User, Verifier, Admin)
router.post('/', userAuth, validateLoanApplication, createLoanApplication);

// @route   GET /api/loans/my-applications
// @desc    Get current user's loan applications
// @access  Private (User, Verifier, Admin)
router.get('/my-applications', userAuth, getUserLoanApplications);

// @route   GET /api/loans
// @desc    Get all loan applications (with pagination and filters)
// @access  Private (Verifier, Admin)
router.get('/', verifierAuth, validatePagination, getAllLoanApplications);

// @route   GET /api/loans/:applicationId
// @desc    Get single loan application by ID
// @access  Private (User can see own, Verifier/Admin can see all)
router.get('/:applicationId', authenticate, validateObjectId, getLoanApplicationById);

// @route   PUT /api/loans/:applicationId/verify
// @desc    Verify or reject loan application
// @access  Private (Verifier, Admin)
router.put('/:applicationId/verify', verifierAuth, validateObjectId, validateLoanAction, verifyLoanApplication);

// @route   PUT /api/loans/:applicationId/approve
// @desc    Approve or reject loan application (final decision)
// @access  Private (Admin only)
router.put('/:applicationId/approve', adminAuth, validateObjectId, validateLoanAction, approveLoanApplication);

export default router; 