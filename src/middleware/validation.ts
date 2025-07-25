import { body, param, query } from 'express-validator';

// Authentication validations
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('role')
    .optional()
    .isIn(['user', 'verifier', 'admin'])
    .withMessage('Role must be user, verifier, or admin')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUpdateProfile = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
];

// Loan application validations
export const validateLoanApplication = [
  body('applicantFirstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Applicant first name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Applicant first name can only contain letters and spaces'),
  body('applicantLastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Applicant last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Applicant last name can only contain letters and spaces'),
  body('employmentStatus')
    .isIn(['employed', 'self-employed', 'unemployed', 'student', 'retired'])
    .withMessage('Please select a valid employment status'),
  body('employmentAddress')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Employment address must be between 10 and 200 characters'),
  body('reasonForLoan')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason for loan must be between 10 and 500 characters'),
  body('loanAmount')
    .isNumeric()
    .withMessage('Loan amount must be a number')
    .custom((value) => {
      const amount = parseFloat(value);
      if (amount < 1000 || amount > 10000000) {
        throw new Error('Loan amount must be between ₹1,000 and ₹1,00,00,000');
      }
      return true;
    })
];

export const validateLoanAction = [
  body('action')
    .isIn(['verify', 'reject', 'approve'])
    .withMessage('Action must be verify, reject, or approve'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters')
];

// Admin validations
export const validateCreateAdmin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
];

export const validateUpdateUser = [
  body('role')
    .optional()
    .isIn(['user', 'verifier', 'admin'])
    .withMessage('Role must be user, verifier, or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Parameter validations
export const validateObjectId = [
  param('applicationId')
    .isMongoId()
    .withMessage('Invalid application ID'),
];

export const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

// Query validations
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'verified', 'approved', 'rejected', 'all'])
    .withMessage('Status must be pending, verified, approved, rejected, or all'),
  query('role')
    .optional()
    .isIn(['user', 'verifier', 'admin', 'all'])
    .withMessage('Role must be user, verifier, admin, or all'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
]; 