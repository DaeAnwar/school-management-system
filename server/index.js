// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cron = require('node-cron');
const seedFeesForMonth = require('./utils/seedMonthlyFees');

dotenv.config();
connectDB();

const app = express();

// Body parser
app.use(express.json());


// Allow prod, all preview deployments for this project, and local dev
const allowed = [
  "https://school-management-system-eta-gold.vercel.app", // prod
  "http://localhost:5173",                                // dev
];

const vercelPreviewRegex = /^https:\/\/school-management-system-[a-z0-9-]+\.vercel\.app$/;
// if your project name or team namespace differs, adapt the regex accordingly.
// Examples that will match:
//   https://school-management-system-abc123.vercel.app
//   https://school-management-system-git-main-<team>.vercel.app
//   https://school-management-system-<hash>-<team>.vercel.app

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/postman
      if (allowed.includes(origin) || vercelPreviewRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// (Optional, but safe) respond to preflight explicitly
app.options("*", cors());


// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/enrollments', require('./routes/enrollments'));

// Simple health check
app.get('/health', (_, res) => res.send('ok'));

// Errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  cron.schedule('0 0 1 * *', async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    try {
      await seedFeesForMonth(month, today);
      console.log('✅ Monthly fees generated.');
    } catch (err) {
      console.error('❌ Failed to seed monthly fees:', err.message);
    }
  });
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
