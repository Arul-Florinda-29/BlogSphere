const router = require('express').Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/posts/:id/comments', optionalAuth, async (req, res, next) => {
  try {
    const list = await Comment.find({ post: req.params.id }).sort('createdAt').populate('author', 'name username avatar');
    res.json(list.map((c) => ({
      _id: c._id, content: c.content, author: c.author, parent: c.parent, createdAt: c.createdAt, updatedAt: c.updatedAt,
      likeCount: c.likes.length, liked: req.user ? c.likes.some((i) => String(i) === String(req.user._id)) : false,
    })));
  } catch (e) { next(e); }
});

router.post('/posts/:id/comments', protect, async (req, res, next) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Comment cannot be empty' });
    if (!(await Post.exists({ _id: req.params.id, status: 'published' }))) return res.status(404).json({ message: 'Post not found' });
    if (req.body.parent && !(await Comment.exists({ _id: req.body.parent, post: req.params.id }))) return res.status(400).json({ message: 'Invalid parent comment' });
    const c = await Comment.create({ post: req.params.id, author: req.user._id, content, parent: req.body.parent || null });
    const post = await Post.findById(req.params.id).select('author title');
    const recipient = req.body.parent ? (await Comment.findById(req.body.parent).select('author'))?.author : post.author;
    if (recipient && String(recipient) !== String(req.user._id)) await Notification.create({ recipient, sender: req.user._id, type: req.body.parent ? 'reply' : 'comment', message: req.body.parent ? `${req.user.name} replied to your comment` : `${req.user.name} commented on your post`, relatedPost: post._id, relatedComment: c._id });
    res.status(201).json(c);
  } catch (e) { next(e); }
});

router.put('/comments/:id', protect, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    if (String(c.author) !== String(req.user._id)) return res.status(403).json({ message: 'You can only edit your own comments' });
    if (!(req.body.content || '').trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    c.content = req.body.content.trim(); await c.save();
    res.json(c);
  } catch (e) { next(e); }
});

router.delete('/comments/:id', protect, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    if (String(c.author) !== String(req.user._id) && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Not allowed' });
    let ids = [c._id], frontier = [c._id];
    while (frontier.length) {
      const kids = await Comment.find({ parent: { $in: frontier } }).select('_id');
      frontier = kids.map((k) => k._id); ids = ids.concat(frontier);
    }
    await Comment.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Comment deleted' });
  } catch (e) { next(e); }
});

router.post('/comments/:id/like', protect, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    const has = c.likes.some((i) => String(i) === String(req.user._id));
    has ? c.likes.pull(req.user._id) : c.likes.push(req.user._id);
    await c.save();
    if (!has && String(c.author) !== String(req.user._id)) await Notification.create({ recipient: c.author, sender: req.user._id, type: 'comment_like', message: `${req.user.name} liked your comment`, relatedPost: c.post, relatedComment: c._id });
    res.json({ liked: !has, likeCount: c.likes.length });
  } catch (e) { next(e); }
});
module.exports = router;
