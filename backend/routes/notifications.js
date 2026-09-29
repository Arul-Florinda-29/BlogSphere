const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res, next) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50).populate('sender', 'name username avatar').populate('relatedPost', 'title slug'),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
    ]);
    res.json({ items, unread });
  } catch (e) { next(e); }
});
router.put('/read-all', async (req, res, next) => {
  try { await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true }); res.json({ ok: true }); } catch (e) { next(e); }
});
router.put('/:id/read', async (req, res, next) => {
  try { await Notification.updateOne({ _id: req.params.id, recipient: req.user._id }, { read: true }); res.json({ ok: true }); } catch (e) { next(e); }
});
module.exports = router;
