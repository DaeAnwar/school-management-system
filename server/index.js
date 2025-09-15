const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cron = require('node-cron');
const seedFeesForMonth = require('./utils/seedMonthlyFees');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: 'https://school-management-system-eta-gold.vercel.app', // no trailing slash
  credentials: true
}));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/enrollments', require('./routes/enrollments'));

// Error handler middleware
app.use(errorHandler);

// Serve frontend in production
//if (process.env.NODE_ENV === 'production') {
//  app.use(express.static(path.join(__dirname, '../client/dist')));
//  app.get('*', (req, res) => {
//    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
//  });
//}

const PORT = process.env.PORT || 5000;

// ✅ Start server & assign to variable
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
 cron.schedule('0 0 1 * *', async () => {
  const today = new Date();
  const month = today.getMonth() + 1;

  console.log(`🕐 Running monthly fee seeder for month ${month}`);
  try {
    await seedFeesForMonth(month, today); // ← pass full date
    console.log(`✅ Monthly fees generated.`);
  } catch (err) {
    console.error('❌ Failed to seed monthly fees:', err.message);
  }
});
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
