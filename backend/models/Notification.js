const mongoose = require('mongoose');
module.exports = mongoose.model('Notification', new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['comment', 'reply', 'post_like', 'comment_like'], required: true },
  message: { type: String, required: true, maxlength: 220 },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true }));
