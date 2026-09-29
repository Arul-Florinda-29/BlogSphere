const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { protect, adminOnly } = require('../middleware/auth');
router.use(protect, adminOnly);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [users, posts, published, comments, reports, agg] = await Promise.all([
      User.countDocuments(), Post.countDocuments(), Post.countDocuments({ status: 'published' }), Comment.countDocuments(), Report.countDocuments({ status: 'open' }),
      Post.aggregate([{ $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: { $size: '$likes' } } } }]),
    ]);
    res.json({ users, posts, published, drafts: posts - published, comments, reports, views: agg[0]?.views || 0, likes: agg[0]?.likes || 0 });
  } catch (e) { next(e); }
});
router.get('/users', async (req, res, next) => { try { res.json(await User.find().sort('-createdAt')); } catch (e) { next(e); } });
router.put('/users/:id/suspend', async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    if (u.role === 'ADMIN') return res.status(400).json({ message: 'Cannot suspend an admin' });
    u.suspended = !u.suspended; await u.save();
    res.json(u);
  } catch (e) { next(e); }
});
router.get('/posts', async (req, res, next) => { try { res.json(await Post.find().select('-content').sort('-createdAt').populate('author', 'username')); } catch (e) { next(e); } });
router.get('/comments', async (req, res, next) => {
  try { res.json(await Comment.find().sort('-createdAt').limit(100).populate('author', 'username').populate('post', 'title slug')); } catch (e) { next(e); }
});
router.get('/reports', async (req, res, next) => {
  try {
    const rows = await Report.find().sort('-createdAt').limit(200)
      .populate('reporter', 'name username')
      .populate('post', 'title slug')
      .populate('comment', 'content');
    res.json(rows);
  } catch (e) { next(e); }
});
router.put('/reports/:id', async (req, res, next) => {
  try {
    const status = ['resolved', 'dismissed'].includes(req.body.status) ? req.body.status : null;
    if (!status) return res.status(400).json({ message: 'Invalid report status' });
    const r = await Report.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Report not found' });
    r.status = status; r.resolvedAt = new Date(); await r.save();
    res.json(r);
  } catch (e) { next(e); }
});

module.exports = router;
