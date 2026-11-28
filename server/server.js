require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// JWT secret nasel tar server suru hou det nahi
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short (min 16 characters) in .env');
  process.exit(1);
}

const app = express();

// Render/Vercel sarkhya proxy chya magun asato, tyamule real user IP (rate limit sathi) milto
app.set('trust proxy', 1);

// CLIENT_URL: ek kiva comma-separated URLs. Shevtcha "/" apoap kadhla jato.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', app: 'AI Notes Generator API' }));
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
