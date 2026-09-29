require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

// NoSQL-injection protection: strip keys starting with "$" or containing "."
const clean = (o) => {
  if (o && typeof o === 'object')
    for (const k of Object.keys(o)) (k.startsWith('$') || k.includes('.')) ? delete o[k] : clean(o[k]);
};
app.use((req, res, next) => { clean(req.body); clean(req.query); clean(req.params); next(); });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/comments'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  res.status(500).json({ message: 'Server error' });
});

connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')))
  .catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });
