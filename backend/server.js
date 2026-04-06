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

// Setup environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Notifications Engine
startNotificationEngine();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('Smart Daily Life API is running...');
});

// App Routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 📡 Incoming ${req.method} ${req.url}`);
  // Add debug point as requested
  console.log("API hit - Flow processing started");
  next();
});

app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.log("🔴 Global Error Handler caught an error");
  console.error(err);
  
  const statusCode = (res.statusCode === 200 || !res.statusCode) ? 500 : res.statusCode;
  const message = err.message || "Server error";
  
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
