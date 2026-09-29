const jwt = require('jsonwebtoken');
const User = require('../models/User');

const load = async (req) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const u = await User.findById(id);
    return u && !u.suspended ? u : null;
  } catch { return null; }
};
exports.protect = async (req, res, next) => {
  const u = await load(req);
  if (!u) return res.status(401).json({ message: 'Not authenticated' });
  req.user = u; next();
};
exports.optionalAuth = async (req, res, next) => { req.user = await load(req); next(); };
exports.adminOnly = (req, res, next) =>
  req.user && req.user.role === 'ADMIN' ? next() : res.status(403).json({ message: 'Admin access required' });
