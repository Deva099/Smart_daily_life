import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import { startNotificationEngine } from './services/notificationService.js';

// process error listeners
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

import errorHandler from './middleware/errorMiddleware.js';

// Setup environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Notifications Engine
startNotificationEngine();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Vite default
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging (simplified for clear visibility)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📡 ${req.method} ${req.url}`);
  next();
});

// App Routes
app.use('/api', apiRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
