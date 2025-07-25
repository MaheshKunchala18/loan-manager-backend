import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): any => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.verify(token, jwtSecret);
}; 