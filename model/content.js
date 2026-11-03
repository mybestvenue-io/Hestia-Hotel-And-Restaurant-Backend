// models/UrlContent.js
const mongoose = require('mongoose');

const urlContentSchema = new mongoose.Schema({
  url_path: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  top_content: {
    type: String,
    default: ''
  },
  bottom_content: {
    type: String,
    default: ''
  },
  meta_title: String,
  meta_description: String,
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UrlContent', urlContentSchema);