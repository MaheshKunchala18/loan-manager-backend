import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;

    // Build query
    let query: any = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error getting users' });
  }
};

// Create new admin user
export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Create new admin user
    const adminUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error creating admin user' });
  }
};

// Create new verifier user
export const createVerifier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Create new verifier user
    const verifierUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'verifier'
    });

    await verifierUser.save();

    res.status(201).json({
      message: 'Verifier user created successfully',
      user: {
        id: verifierUser._id,
        email: verifierUser.email,
        firstName: verifierUser.firstName,
        lastName: verifierUser.lastName,
        role: verifierUser.role,
        isActive: verifierUser.isActive,
        createdAt: verifierUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create verifier error:', error);
    res.status(500).json({ message: 'Server error creating verifier user' });
  }
};

// Update user role or status
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { userId } = req.params;
    const { role, isActive } = req.body;

    // Prevent admin from updating their own account
    if (userId === req.user._id.toString()) {
      res.status(400).json({ message: 'Cannot update your own account' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields
    if (role !== undefined) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// Delete user (soft delete by deactivating)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { userId } = req.params;

    // Prevent admin from deleting their own account
    if (userId === req.user._id.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deleted successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Get system statistics
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get user statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    const totalVerifiers = await User.countDocuments({ role: 'verifier', isActive: true });
    const totalBorrowers = await User.countDocuments({ role: 'user', isActive: true });

    res.json({
      userStats: {
        totalUsers,
        totalAdmins,
        totalVerifiers,
        totalBorrowers,
        inactiveUsers: await User.countDocuments({ isActive: false })
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error getting system statistics' });
  }
}; 