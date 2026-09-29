const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: '' },
  content: { type: String, required: true },
  featuredImage: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  tags: [{ type: String, lowercase: true, trim: true }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readingTime: { type: Number, default: 1 },
  wordCount: { type: Number, default: 0 },
  publishedAt: Date,
}, { timestamps: true });
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ tags: 1 });
module.exports = mongoose.model('Post', postSchema);
