const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    inputType: { type: String, enum: ['topic', 'url', 'image'], required: true },
    source: { type: String, default: '' }, // topic text, url, or image file name
    content: { type: String, required: true }, // generated markdown
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
