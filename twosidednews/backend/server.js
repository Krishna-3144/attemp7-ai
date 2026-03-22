require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const analyzeRoutes = require('./routes/analyze');
const compareRoutes = require('./routes/compare');
const voteRoutes = require('./routes/votes');
const trendingRoutes = require('./routes/trending');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all in dev
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/trending', trendingRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`   Fix: Run this in PowerShell to free the port:`);
      console.error(`   netstat -ano | findstr :${PORT}`);
      console.error(`   taskkill /PID <PID_NUMBER> /F\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

// Connect MongoDB then start, or start anyway if DB fails
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twosidednews')
  .then(() => {
    console.log('✅ MongoDB connected');
    startServer();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting without MongoDB (votes/trending will use in-memory storage)...\n');
    startServer();
  });

// Debug endpoint: check which Grok models are available with your API key
app.get('/api/debug/models', async (req, res) => {
  const axios = require('axios');
  try {
    const response = await axios.get(`${process.env.GROK_API_URL || 'https://api.x.ai/v1'}/models`, {
      headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}` },
      timeout: 10000,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: err.response?.data || err.message,
      status: err.response?.status,
    });
  }
});
