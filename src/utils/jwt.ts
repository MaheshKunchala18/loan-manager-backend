import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
}; 