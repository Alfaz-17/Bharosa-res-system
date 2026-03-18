import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Config
import { env } from './config/env.js';

// Middleware
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { sendError } from './utils/response.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import billingRoutes from './routes/billing.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import userRoutes from './routes/user.routes.js';
import mediaRoutes from './routes/media.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import path from 'path';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  credentials: true,
  origin: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting
app.use(generalLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date(), env: env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/restaurant', restaurantRoutes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 'Route not found', 404);
});

// Global error handler
app.use(errorMiddleware);

export default app;
