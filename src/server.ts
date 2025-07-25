import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './utils/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { corsMiddleware, generalLimiter, authLimiter, loanApplicationLimiter } from './middleware/security';
import { createSampleData } from './utils/seedData';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const app = express();

app.use(corsMiddleware);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

connectDB();

const apiPrefix = process.env.API_PREFIX || '/api';
app.use(apiPrefix, generalLimiter);
app.use(`${apiPrefix}/auth/login`, authLimiter);
app.use(`${apiPrefix}/auth/register`, authLimiter);
app.use(`${apiPrefix}/loans`, loanApplicationLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

app.use(apiPrefix, routes);

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

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, async () => {
  console.log(`\n🚀 ${process.env.VITE_APP_NAME || 'CreditSea'} API Server Running`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}${apiPrefix}/health`);
  console.log(`📋 API Routes: http://localhost:${PORT}${apiPrefix}`);
  console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

  if (NODE_ENV === 'production') {
    console.log(`🔒 CORS enabled for production domains`);
  }

  if (NODE_ENV === 'development') {
    console.log('\n🔧 Setting up development data...');
    await createSampleData();
  }

  console.log('\n✅ Server initialization complete!\n');
});

export default app; 