const router = require('express').Router();
const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
router.use(protect);
const reasons = ['Spam', 'Offensive content', 'Misleading content', 'Harassment', 'Other'];
router.post('/post/:id', async (req, res, next) => {
  try {
    if (!reasons.includes(req.body.reason)) return res.status(400).json({ message: 'Choose a valid report reason' });
    if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'Post not found' });
    const exists = await Report.findOne({ reporter: req.user._id, post: req.params.id, status: 'open' });
    if (exists) return res.status(409).json({ message: 'You already reported this post' });
    const r = await Report.create({ reporter: req.user._id, post: req.params.id, reason: req.body.reason, description: String(req.body.description || '').slice(0, 500) });
    res.status(201).json(r);
  } catch (e) { next(e); }
});
router.post('/comment/:id', async (req, res, next) => {
  try {
    if (!reasons.includes(req.body.reason)) return res.status(400).json({ message: 'Choose a valid report reason' });
    if (!(await Comment.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'Comment not found' });
    const exists = await Report.findOne({ reporter: req.user._id, comment: req.params.id, status: 'open' });
    if (exists) return res.status(409).json({ message: 'You already reported this comment' });
    const r = await Report.create({ reporter: req.user._id, comment: req.params.id, reason: req.body.reason, description: String(req.body.description || '').slice(0, 500) });
    res.status(201).json(r);
  } catch (e) { next(e); }
});
module.exports = router;
