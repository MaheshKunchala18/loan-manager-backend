import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Rate limiting configuration using environment variables
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: windowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints using environment variables
// More lenient limits for development
export const generalLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute instead of 15
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests instead of 100
  'Too many requests from this IP, please try again later'
);

export const authLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute instead of 15
  parseInt(process.env.AUTH_RATE_LIMIT_MAX || '50'), // 50 auth requests instead of 5
  'Too many authentication attempts, please try again later'
);

export const loanApplicationLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  parseInt(process.env.LOAN_RATE_LIMIT_MAX || '100'), // 100 loan applications instead of 10
  'Too many loan applications, please try again later'
);

// CORS configuration using environment variables
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export const corsMiddleware = cors(corsOptions); 