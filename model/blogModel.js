const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    content: { type: String, required: true },
    image: { type: String },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: false,
      default: null 
    },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
