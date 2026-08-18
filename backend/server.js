const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

dotenv.config();

const app = express();

// Connect Database & Initialize Memory Store
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/exceptions', require('./src/routes/exceptionRoutes'));
app.use('/api/inventory', require('./src/routes/inventoryRoutes'));
app.use('/api/restock', require('./src/routes/restockRoutes'));
app.use('/api/workers', require('./src/routes/workerRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Warehouse Operations API is active' });
});

// 404 JSON Handler
app.use((req, res) => {
  res.status(404).json({ message: `API endpoint ${req.originalUrl} not found` });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
