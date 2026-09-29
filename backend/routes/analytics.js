const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).select('title status views likes publishedAt createdAt');
    const postIds = posts.map((p) => p._id);
    const comments = await Comment.countDocuments({ post: { $in: postIds } });
    const published = posts.filter((p) => p.status === 'published');
    const totalViews = posts.reduce((s, p) => s + p.views, 0);
    const totalLikes = posts.reduce((s, p) => s + p.likes.length, 0);
    const top = [...published].sort((a, b) => b.views - a.views).slice(0, 5).map((p) => ({ _id: p._id, title: p.title, views: p.views, likes: p.likes.length }));
    res.json({ totals: { posts: posts.length, published: published.length, drafts: posts.length - published.length, views: totalViews, likes: totalLikes, comments }, top });
  } catch (e) { next(e); }
});
module.exports = router;
