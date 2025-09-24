// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cron = require('node-cron');
const seedFeesForMonth = require('./utils/seedMonthlyFees');
const SchoolYear = require('./models/SchoolYear'); // ✅ Add this

dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Allowed origins
const allowed = [
  "https://school-management-system-eta-gold.vercel.app",
  "http://localhost:5173"
];
const vercelPreviewRegex = /^https:\/\/school-management-system-[a-z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowed.includes(origin) || vercelPreviewRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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
app.use('/api/school-years', require('./routes/schoolYears'));

// Health check
app.get('/health', (_, res) => res.send('ok'));

// Error handler
app.use(errorHandler);

// ✅ Auto-create school year if none exist
const ensureDefaultYear = async () => {
  const existing = await SchoolYear.find();
  if (existing.length === 0) {
    const now = new Date();
    const year = now.getFullYear();
    const defaultYear = now.getMonth() + 1 >= 9
      ? `${year}-${year + 1}`
      : `${year - 1}-${year}`;

    await SchoolYear.create({ year: defaultYear, isCurrent: true });
    console.log(`✅ Created default school year: ${defaultYear}`);
  }
};

// Connect DB, run logic, then start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await ensureDefaultYear(); // ✅ Call it here

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // Monthly fees cron job
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

  // Graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
