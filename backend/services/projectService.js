import { Project } from '../models/index.js'; import { notFound } from './portfolioService.js';
export function list(uid, { q, tag, category, sort = 'order' }) {
  const f = { user: uid }; if (q) f.title = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); if (tag) f.tags = String(tag); if (category) f.category = String(category);
  return Project.find(f).sort(sort === 'newest' ? { createdAt: -1 } : sort === 'title' ? { title: 1 } : { order: 1, createdAt: -1 });
}
export async function duplicate(uid, id) {
  const p = await Project.findOne({ _id: id, user: uid }); if (!p) throw notFound();
  const { _id, createdAt, updatedAt, ...o } = p.toObject(); return Project.create({ ...o, title: o.title + ' (copy)', status: 'draft', featured: false });
}
