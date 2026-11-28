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

const notFound = () => {
  const err = new Error('Note not found');
  err.status = 404;
  return err;
};

// req.user.id auth middleware kadun yeto. Pratyek query tya user chyach notes paryant limited.
const withMeta = (note) => ({ ...note.toObject(), meta: getNoteMeta(note.content) });

// POST /api/notes/topic   body: { topic, depth? }
exports.createFromTopic = async (req, res, next) => {
  try {
    const topic = typeof req.body.topic === 'string' ? req.body.topic.trim() : '';
    if (!topic) throw badRequest('Topic is required');
    if (topic.length > 500) throw badRequest('Topic is too long (max 500 characters)');

    const content = await generateFromTopic(topic, normalizeDepth(req.body.depth));
    const note = await Note.create({
      user: req.user.id,
      title: extractTitle(content, topic),
      inputType: 'topic',
      source: topic,
      content,
    });
    res.status(201).json(withMeta(note));
  } catch (err) {
    next(err);
  }
};

// POST /api/notes/url   body: { url, depth? }
exports.createFromUrl = async (req, res, next) => {
  try {
    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
    if (!url) throw badRequest('URL is required');

    const { text, pageTitle } = await scrapeUrl(url);
    const content = await generateFromUrl(url, text, normalizeDepth(req.body.depth));
    const note = await Note.create({
      user: req.user.id,
      title: extractTitle(content, pageTitle || 'Untitled Notes'),
      inputType: 'url',
      source: url,
      content,
    });
    res.status(201).json(withMeta(note));
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
      user: req.user.id,
      title: extractTitle(content),
      inputType: 'image',
      source: req.file.originalname,
      content,
    });
    res.status(201).json(withMeta(note));
  } catch (err) {
    next(err);
  }
};

// GET /api/notes  -> fakt tya user che notes (content nahi, fakt meta)
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id })
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
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) throw notFound(); // dusrya user cha note pan 404 (exist karto he sangat nahi)
    res.json(withMeta(note));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw badRequest('Invalid note id');
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) throw notFound();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};
