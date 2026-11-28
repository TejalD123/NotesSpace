const express = require('express');
const upload = require('../middleware/upload');
const requireAuth = require('../middleware/auth');
const { generateLimiter } = require('../middleware/rateLimiters');
const {
  createFromTopic,
  createFromUrl,
  createFromImage,
  getNotes,
  getNoteById,
  deleteNote,
} = require('../controllers/notesController');

const router = express.Router();

router.use(requireAuth); // sagle notes routes la login pahije

router.post('/topic', generateLimiter, createFromTopic);
router.post('/url', generateLimiter, createFromUrl);
router.post('/image', generateLimiter, upload.single('image'), createFromImage);

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

module.exports = router;
