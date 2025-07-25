import { Router } from 'express';
import authRoutes from './authRoutes';
import loanRoutes from './loanRoutes';
import adminRoutes from './adminRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    message: 'CreditSea API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/loans', loanRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);

// Catch-all route for undefined endpoints
router.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

export default router; 