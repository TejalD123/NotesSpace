require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const notesRoutes = require('./routes/notesRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', app: 'NotesSpace API' }));
app.use('/api/notes', notesRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
