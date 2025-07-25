import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './utils/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { corsMiddleware, generalLimiter, authLimiter, loanApplicationLimiter } from './middleware/security';
import { createInitialAdmin, createSampleData } from './utils/seedData';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(corsMiddleware);

// Rate limiting with environment variables
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(apiPrefix, generalLimiter);
app.use(`${apiPrefix}/auth/login`, authLimiter);
app.use(`${apiPrefix}/auth/register`, authLimiter);
app.use(`${apiPrefix}/loans`, loanApplicationLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use(apiPrefix, routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${process.env.VITE_APP_NAME || 'CreditSea'} Loan Management API`,
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: `${apiPrefix}/health`,
      auth: `${apiPrefix}/auth`,
      loans: `${apiPrefix}/loans`,
      admin: `${apiPrefix}/admin`,
      dashboard: `${apiPrefix}/dashboard`
    },
    documentation: `API documentation available at ${apiPrefix}/docs`
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize server
const PORT = parseInt(process.env.PORT || '5000');
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, async () => {
  console.log(`\n🚀 ${process.env.VITE_APP_NAME || 'CreditSea'} API Server Running`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}${apiPrefix}/health`);
  console.log(`📋 API Routes: http://localhost:${PORT}${apiPrefix}`);
  console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Create initial admin user and sample data
  if (NODE_ENV === 'development') {
    console.log('\n🔧 Setting up development data...');
    await createInitialAdmin();
    await createSampleData();
  }
  
  console.log('\n✅ Server initialization complete!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app; 