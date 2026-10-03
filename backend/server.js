import 'dotenv/config'; import helmet from 'helmet'; import rateLimit from 'express-rate-limit'; import { seedThemes } from './services/themeService.js'; import { sanitize } from './middleware/validate.js'; import { publishedUsernames } from './services/portfolioService.js'; import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose';
import auth from './routes/auth.js'; import data from './routes/data.js'; import { User, Portfolio } from './models/index.js'; import { errors } from './middleware/auth.js';
import { uploadDir } from './middleware/upload.js';
if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in .env');
const app = express(); const client = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); app.use(cors({ origin: client })); app.use(express.json({ limit: '1mb' })); app.use(sanitize); app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60e3, limit: 50, message: { message: 'Too many attempts, try again in a few minutes' } }));
app.use('/api/auth', auth); app.use('/api', data);
// Crawler-friendly share page with Open Graph / Twitter tags, then redirects people to the SPA
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
app.get('/share/:username', async (q, s) => {
  const u = await User.findOne({ username: q.params.username.toLowerCase() }); const pf = u && await Portfolio.findOne({ user: u._id, published: true });
  if (!pf) return s.status(404).send('Not found');
  const t = esc(`${u.name} | Portfolio`), d = esc(u.headline || u.bio || 'Intern project portfolio'), img = u.avatar ? esc(`${q.protocol}://${q.get('host')}${u.avatar}`) : '', url = `${client}/portfolio/${u.username}`;
  s.send(`<!doctype html><title>${t}</title><meta name="description" content="${d}"><meta property="og:title" content="${t}"><meta property="og:description" content="${d}"><meta property="og:type" content="profile"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url=${url}">`);
});
app.get('/sitemap.xml', async (q, s) => { const us = await publishedUsernames(); s.type('xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${us.map(u => `<url><loc>${client}/portfolio/${u.username}</loc><lastmod>${u.updatedAt.toISOString()}</lastmod></url>`).join('')}</urlset>`); });
app.use(errors);
export { app };

if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URI)
    .then(seedThemes)
    .then(() => app.listen(process.env.PORT || 5000, () => console.log('API ready')))
    .catch(e => { console.error(e.message); process.exit(1); });
}
