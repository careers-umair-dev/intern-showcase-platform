import { Project } from '../models/index.js'; import * as svc from '../services/projectService.js'; import { notFound } from '../services/portfolioService.js';
export const list = async (q, s) => s.json(await svc.list(q.uid, q.query));
export const create = async (q, s) => { const { _id, user, ...f } = q.body; s.status(201).json(await Project.create({ ...f, user: q.uid })); };
export const update = async (q, s) => { const { _id, user, ...f } = q.body; const p = await Project.findOneAndUpdate({ _id: q.params.id, user: q.uid }, f, { new: true }); if (!p) throw notFound(); s.json(p); };
export const remove = async (q, s) => { if (!(await Project.findOneAndDelete({ _id: q.params.id, user: q.uid }))) throw notFound(); s.json({ ok: true }); };
export const duplicate = async (q, s) => s.status(201).json(await svc.duplicate(q.uid, q.params.id));
