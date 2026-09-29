const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, optionalAuth } = require('../middleware/auth');
const Notification = require('../models/Notification');

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populate = (q) => q.populate('author', 'name username avatar bio').populate('category', 'name slug');
const shape = (p, user) => {
  const o = p.toObject();
  o.likeCount = o.likes.length;
  o.liked = user ? o.likes.some((id) => String(id) === String(user._id)) : false;
  delete o.likes;
  return o;
};
const compute = (content = '') => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return { wordCount: words, readingTime: Math.max(1, Math.ceil(words / 200)) };
};
const cleanTags = (t) => (Array.isArray(t) ? t : String(t || '').split(',')).map((x) => String(x).trim().toLowerCase()).filter(Boolean).slice(0, 8);

// List / search / filter (published only)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q, category, tag, author, sort = 'latest' } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1), limit = 9;
    const filter = { status: 'published' };
    if (q) { const rx = new RegExp(escapeRx(String(q)), 'i'); filter.$or = [{ title: rx }, { content: rx }, { tags: rx }]; }
    if (category) { const c = await Category.findOne({ slug: String(category) }); filter.category = c ? c._id : null; }
    if (tag) filter.tags = String(tag).toLowerCase();
    if (author) { const u = await User.findOne({ username: String(author).toLowerCase() }); filter.author = u ? u._id : null; }
    const sortBy = sort === 'popular' ? { views: -1 } : sort === 'oldest' ? { publishedAt: 1 } : { publishedAt: -1 };
    const [posts, total] = await Promise.all([
      populate(Post.find(filter).select('-content').sort(sortBy).skip((page - 1) * limit).limit(limit)),
      Post.countDocuments(filter),
    ]);
    res.json({ posts: posts.map((p) => shape(p, req.user)), total, pages: Math.ceil(total / limit), page });
  } catch (e) { next(e); }
});

// Logged-in user's own posts (drafts + published)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const posts = await populate(Post.find({ author: req.user._id }).select('-content').sort('-updatedAt'));
    res.json(posts.map((p) => shape(p, req.user)));
  } catch (e) { next(e); }
});

router.get('/bookmarks/all', protect, async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id).populate({ path: 'bookmarks', select: '-content', populate: [{ path: 'author', select: 'name username avatar' }, { path: 'category', select: 'name slug' }] });
    res.json(u.bookmarks.filter(Boolean).map((p) => shape(p, req.user)));
  } catch (e) { next(e); }
});

router.get('/slug/:slug', optionalAuth, async (req, res, next) => {
  try {
    const post = await populate(Post.findOne({ slug: req.params.slug }));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const isOwner = req.user && (String(post.author._id) === String(req.user._id) || req.user.role === 'ADMIN');
    if (post.status !== 'published' && !isOwner) return res.status(404).json({ message: 'Post not found' });
    if (post.status === 'published') { post.views += 1; await post.save(); }
    const out = shape(post, req.user);
    out.bookmarked = req.user ? req.user.bookmarks.some((b) => String(b) === String(post._id)) : false;
    out.commentCount = await Comment.countDocuments({ post: post._id });
    const related = await populate(Post.find({ status: 'published', _id: { $ne: post._id }, $or: [{ category: post.category?._id }, { tags: { $in: post.tags } }] }).select('-content').limit(3));
    out.related = related.map((p) => shape(p, null));
    res.json(out);
  } catch (e) { next(e); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Not allowed' });
    res.json(post);
  } catch (e) { next(e); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { title, content, excerpt, featuredImage, category, tags, status } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    const slug = `${slugify(title) || 'post'}-${Date.now().toString(36)}`;
    const st = status === 'published' ? 'published' : 'draft';
    const post = await Post.create({
      title, slug, content, featuredImage, category: category || undefined, tags: cleanTags(tags), status: st,
      excerpt: excerpt || content.slice(0, 160), author: req.user._id, publishedAt: st === 'published' ? new Date() : undefined, ...compute(content),
    });
    res.status(201).json(post);
  } catch (e) { next(e); }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'You can only edit your own posts' });
    const { title, content, excerpt, featuredImage, category, tags, status } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    Object.assign(post, { title, content, excerpt: excerpt || content.slice(0, 160), featuredImage, category: category || undefined, tags: cleanTags(tags), ...compute(content) });
    if (status === 'published' && post.status !== 'published') { post.status = 'published'; post.publishedAt = new Date(); }
    else if (status === 'draft') post.status = 'draft';
    await post.save();
    res.json(post);
  } catch (e) { next(e); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Not allowed' });
    await Comment.deleteMany({ post: post._id });
    await User.updateMany({}, { $pull: { bookmarks: post._id } });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const p = await Post.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Post not found' });
    const already = p.likes.some((id) => String(id) === String(req.user._id));
    if (!already) {
      p.likes.addToSet(req.user._id); await p.save();
      if (String(p.author) !== String(req.user._id)) await Notification.create({ recipient: p.author, sender: req.user._id, type: 'post_like', message: `${req.user.name} liked your post`, relatedPost: p._id });
    }
    res.json({ liked: true, likeCount: p.likes.length });
  } catch (e) { next(e); }
});
router.delete('/:id/like', protect, async (req, res, next) => {
  try {
    const p = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true });
    p ? res.json({ liked: false, likeCount: p.likes.length }) : res.status(404).json({ message: 'Post not found' });
  } catch (e) { next(e); }
});
router.post('/:id/bookmark', protect, async (req, res, next) => {
  try { await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: req.params.id } }); res.json({ bookmarked: true }); } catch (e) { next(e); }
});
router.delete('/:id/bookmark', protect, async (req, res, next) => {
  try { await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: req.params.id } }); res.json({ bookmarked: false }); } catch (e) { next(e); }
});

module.exports = router;
