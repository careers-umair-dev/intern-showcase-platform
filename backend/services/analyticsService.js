import { Project, Portfolio, Analytics } from '../models/index.js';
export async function stats(uid) {
  const [projects, a, pf] = await Promise.all([Project.find({ user: uid }), Analytics.find({ user: uid, createdAt: { $gte: new Date(Date.now() - 14 * 864e5) } }).sort('-createdAt'), Portfolio.findOne({ user: uid })]);
  const days = {}; for (let i = 13; i >= 0; i--) days[new Date(Date.now() - i * 864e5).toISOString().slice(5, 10)] = 0;
  const pv = {}; let total = 0; a.forEach(e => { if (e.type === 'portfolio') { total++; const k = e.createdAt.toISOString().slice(5, 10); if (k in days) days[k]++; } else pv[e.project] = (pv[e.project] || 0) + 1; });
  return { total: projects.length, published: projects.filter(p => p.status === 'published').length, draft: projects.filter(p => p.status !== 'published').length, featured: projects.filter(p => p.featured).length, views14d: total,
    days: Object.entries(days).map(([d, v]) => ({ d, v })), top: projects.map(p => ({ id: p._id, title: p.title, views: pv[p._id] || 0 })).sort((x, y) => y.views - x.views).slice(0, 5),
    recent: a.slice(0, 8).map(e => ({ type: e.type, at: e.createdAt })), live: !!pf?.published };
}
