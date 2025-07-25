import { Response } from 'express';
import { validationResult } from 'express-validator';
import LoanApplication, { ILoanApplication } from '../models/LoanApplication';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create new loan application
export const createLoanApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const {
      applicantFirstName,
      applicantLastName,
      employmentStatus,
      employmentAddress,
      reasonForLoan,
      loanAmount
    } = req.body;

    const loanApplication = new LoanApplication({
      userId: req.user._id,
      applicantFirstName,
      applicantLastName,
      employmentStatus,
      employmentAddress,
      reasonForLoan,
      loanAmount,
      status: 'pending'
    });

    await loanApplication.save();

    res.status(201).json({
      message: 'Loan application submitted successfully',
      application: loanApplication
    });
  } catch (error) {
    console.error('Create loan application error:', error);
    res.status(500).json({ message: 'Server error creating loan application' });
  }
};

// Get user's loan applications
export const getUserLoanApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const applications = await LoanApplication.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('verifiedBy approvedBy rejectedBy', 'firstName lastName');

    res.json({
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get user loan applications error:', error);
    res.status(500).json({ message: 'Server error getting loan applications' });
  }
};

// Get all loan applications (for verifiers and admins)
export const getAllLoanApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { applicantFirstName: { $regex: search, $options: 'i' } },
        { applicantLastName: { $regex: search, $options: 'i' } },
        { reasonForLoan: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const applications = await LoanApplication.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy approvedBy rejectedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalApplications = await LoanApplication.countDocuments(query);
    const totalPages = Math.ceil(totalApplications / limit);

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all loan applications error:', error);
    res.status(500).json({ message: 'Server error getting loan applications' });
  }
};

// Verify loan application (for verifiers)
export const verifyLoanApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    const { action, comments } = req.body;

    if (!['verify', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Invalid action. Must be "verify" or "reject"' });
      return;
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ message: 'Loan application has already been processed' });
      return;
    }

    // Update application based on action
    if (action === 'verify') {
      application.status = 'verified';
      application.verifiedBy = req.user._id;
      application.verificationDate = new Date();
    } else {
      application.status = 'rejected';
      application.rejectedBy = req.user._id;
      application.rejectionDate = new Date();
    }

    if (comments) {
      application.comments = comments;
    }

    await application.save();

    await application.populate('userId verifiedBy rejectedBy', 'firstName lastName email');

    res.json({
      message: `Loan application ${action}d successfully`,
      application
    });
  } catch (error) {
    console.error('Verify loan application error:', error);
    res.status(500).json({ message: 'Server error processing loan application' });
  }
};

// Approve/Reject loan application (for admins)
export const approveLoanApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    const { action, comments } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
      return;
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }

    if (application.status !== 'verified' && application.status !== 'pending') {
      res.status(400).json({ 
        message: 'Only verified or pending applications can be approved/rejected by admin' 
      });
      return;
    }

    // Update application based on action
    if (action === 'approve') {
      application.status = 'approved';
      application.approvedBy = req.user._id;
      application.approvalDate = new Date();
    } else {
      application.status = 'rejected';
      application.rejectedBy = req.user._id;
      application.rejectionDate = new Date();
    }

    if (comments) {
      application.comments = comments;
    }

    await application.save();

    await application.populate('userId verifiedBy approvedBy rejectedBy', 'firstName lastName email');

    res.json({
      message: `Loan application ${action}d successfully`,
      application
    });
  } catch (error) {
    console.error('Approve loan application error:', error);
    res.status(500).json({ message: 'Server error processing loan application' });
  }
};

// Get single loan application details
export const getLoanApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;

    const application = await LoanApplication.findById(applicationId)
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy approvedBy rejectedBy', 'firstName lastName');

    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }

    // Check if user has permission to view this application
    if (req.user.role === 'user' && application.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Access denied. You can only view your own applications' });
      return;
    }

    res.json({ application });
  } catch (error) {
    console.error('Get loan application by ID error:', error);
    res.status(500).json({ message: 'Server error getting loan application' });
  }
}; 