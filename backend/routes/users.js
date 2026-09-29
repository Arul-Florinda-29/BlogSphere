const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const publicUser = (u) => ({ id: u._id, name: u.name, username: u.username, avatar: u.avatar, bio: u.bio, role: u.role, createdAt: u.createdAt });

router.get('/:username', async (req, res, next) => {
  try {
    const u = await User.findOne({ username: String(req.params.username).toLowerCase(), suspended: false }).select('name username avatar bio role createdAt');
    if (!u) return res.status(404).json({ message: 'Author not found' });
    const posts = await Post.find({ author: u._id, status: 'published' }).select('-content').sort('-publishedAt').populate('category', 'name slug').populate('author', 'name username avatar bio');
    res.json({ user: publicUser(u), posts: posts.map((p) => ({ ...p.toObject(), likeCount: p.likes.length })) });
  } catch (e) { next(e); }
});

router.put('/me/profile', protect, async (req, res, next) => {
  try {
    const { name, username, bio, avatar } = req.body;
    if (!name || !username) return res.status(400).json({ message: 'Name and username are required' });
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) return res.status(400).json({ message: 'Username: 3-20 letters, numbers, underscore' });
    const taken = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
    if (taken) return res.status(409).json({ message: 'Username already taken' });
    const u = await User.findById(req.user._id);
    Object.assign(u, { name: name.trim(), username: username.toLowerCase().trim(), bio: String(bio || '').trim().slice(0, 300), avatar: String(avatar || '').trim() });
    await u.save();
    res.json({ user: { id: u._id, name: u.name, username: u.username, email: u.email, role: u.role, avatar: u.avatar, bio: u.bio } });
  } catch (e) { next(e); }
});

router.put('/me/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new passwords are required' });
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) return res.status(400).json({ message: 'New password needs 8+ characters with a letter and a number' });
    const u = await User.findById(req.user._id).select('+password');
    if (!(await bcrypt.compare(currentPassword, u.password))) return res.status(401).json({ message: 'Current password is incorrect' });
    u.password = newPassword; await u.save();
    res.json({ message: 'Password changed successfully' });
  } catch (e) { next(e); }
});
module.exports = router;
