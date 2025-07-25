import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Global error handler middleware
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((error as any).errors).map((val: any) => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if ((error as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
}; 