import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { JwtPayload } from '../types';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

// Verify JWT token
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ message: 'Invalid token. User not found.' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: 'Account is deactivated.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user has required role
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Access denied. Please authenticate.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
      return;
    }

    next();
  };
};

// Middleware combinations for specific roles
export const verifierAuth = [authenticate, authorize('verifier', 'admin')];
export const adminAuth = [authenticate, authorize('admin')];
export const userAuth = [authenticate, authorize('user', 'verifier', 'admin')]; 