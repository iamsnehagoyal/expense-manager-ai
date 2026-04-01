import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import dashboardRoutes from './routes/dashboard';
import budgetRoutes from './routes/budgets';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many attempts, try again later' } });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { message: 'Too many uploads per minute' } });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invoices', authenticate, apiLimiter, invoiceRoutes);
app.use('/api/dashboard', authenticate, apiLimiter, dashboardRoutes);
app.use('/api/budgets', authenticate, apiLimiter, budgetRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
