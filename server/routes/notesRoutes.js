const express = require('express');
const upload = require('../middleware/upload');
const {
  createFromTopic,
  createFromUrl,
  createFromImage,
  getNotes,
  getNoteById,
  deleteNote,
} = require('../controllers/notesController');

const router = express.Router();

router.post('/topic', createFromTopic);
router.post('/url', createFromUrl);
router.post('/image', upload.single('image'), createFromImage);

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

module.exports = router;
