const mongoose = require('mongoose');
module.exports = mongoose.model('Report', new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  reason: { type: String, enum: ['Spam', 'Offensive content', 'Misleading content', 'Harassment', 'Other'], required: true },
  description: { type: String, maxlength: 500, default: '' },
  status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open', index: true },
  resolvedAt: Date,
}, { timestamps: true }));
