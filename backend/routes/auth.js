const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const pub = (u) => ({ id: u._id, name: u.name, username: u.username, email: u.email, role: u.role, avatar: u.avatar, bio: u.bio });

router.post('/register', async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) return res.status(400).json({ message: 'Username: 3-20 letters, numbers, underscore' });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
      return res.status(400).json({ message: 'Password needs 8+ characters with a letter and a number' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    if (await User.findOne({ username: username.toLowerCase() })) return res.status(409).json({ message: 'Username already taken' });
    const user = await User.create({ name, username, email, password });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Enter email/username and password' });
    const id = String(identifier).toLowerCase();
    const user = await User.findOne({ $or: [{ email: id }, { username: id }] }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.suspended) return res.status(403).json({ message: 'Account suspended' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));
module.exports = router;
