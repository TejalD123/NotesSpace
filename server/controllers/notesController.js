const mongoose = require('mongoose');
const Note = require('../models/Note');
const {
  generateFromTopic,
  generateFromUrl,
  generateFromImage,
  extractTitle,
} = require('../services/aiService');
const { normalizeDepth } = require('../services/promptBuilder');
const { scrapeUrl } = require('../services/scraperService');
const { getNoteMeta } = require('../utils/noteMeta');

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

// POST /api/notes/topic   body: { topic, depth? }
exports.createFromTopic = async (req, res, next) => {
  try {
    const topic = (req.body.topic || '').trim();
    if (!topic) throw badRequest('Topic is required');
    if (topic.length > 500) throw badRequest('Topic is too long (max 500 characters)');

    const content = await generateFromTopic(topic, normalizeDepth(req.body.depth));
    const note = await Note.create({
      title: extractTitle(content, topic),
      inputType: 'topic',
      source: topic,
      content,
    });
    res.status(201).json({ ...note.toObject(), meta: getNoteMeta(note.content) });
  } catch (err) {
    next(err);
  }
};

// POST /api/notes/url   body: { url, depth? }
exports.createFromUrl = async (req, res, next) => {
  try {
    const url = (req.body.url || '').trim();
    if (!url) throw badRequest('URL is required');

    const { text, pageTitle } = await scrapeUrl(url);
    const content = await generateFromUrl(url, text, normalizeDepth(req.body.depth));
    const note = await Note.create({
      title: extractTitle(content, pageTitle || 'Untitled Notes'),
      inputType: 'url',
      source: url,
      content,
    });
    res.status(201).json({ ...note.toObject(), meta: getNoteMeta(note.content) });
  } catch (err) {
    next(err);
  }
};

// POST /api/notes/image   form-data: image (file), depth? (text)
exports.createFromImage = async (req, res, next) => {
  try {
    if (!req.file) throw badRequest('Image file is required (field name: image)');

    const content = await generateFromImage(
      req.file.buffer,
      req.file.mimetype,
      normalizeDepth(req.body.depth)
    );
    const note = await Note.create({
      title: extractTitle(content),
      inputType: 'image',
      source: req.file.originalname,
      content,
    });
    res.status(201).json({ ...note.toObject(), meta: getNoteMeta(note.content) });
  } catch (err) {
    next(err);
  }
};

// GET /api/notes  -> list (content nahi, fakt meta)
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .select('title inputType source createdAt content')
      .sort({ createdAt: -1 })
      .lean();
    res.json(notes.map(({ content, ...rest }) => ({ ...rest, meta: getNoteMeta(content) })));
  } catch (err) {
    next(err);
  }
};

// GET /api/notes/:id
exports.getNoteById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw badRequest('Invalid note id');
    const note = await Note.findById(req.params.id);
    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }
    res.json({ ...note.toObject(), meta: getNoteMeta(note.content) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw badRequest('Invalid note id');
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};