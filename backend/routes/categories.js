const router = require('express').Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

router.get('/', async (req, res, next) => { try { res.json(await Category.find().sort('name')); } catch (e) { next(e); } });
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (!req.body.name) return res.status(400).json({ message: 'Name required' });
    res.status(201).json(await Category.create({ name: req.body.name, slug: slugify(req.body.name), description: req.body.description }));
  } catch (e) { e.code === 11000 ? res.status(409).json({ message: 'Category exists' }) : next(e); }
});
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try { await Category.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { next(e); }
});
module.exports = router;
