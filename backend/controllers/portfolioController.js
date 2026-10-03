import { Portfolio } from '../models/index.js'; import * as pub from '../services/portfolioService.js'; import { stats } from '../services/analyticsService.js';
export const mine = async (q, s) => s.json(await Portfolio.findOne({ user: q.uid }));
export const save = async (q, s) => { const { _id, user, ...f } = q.body; s.json(await Portfolio.findOneAndUpdate({ user: q.uid }, f, { new: true })); };
export const getStats = async (q, s) => s.json(await stats(q.uid));
export const page = async (q, s) => s.json(await pub.publicPortfolio(q.params.username));
export const project = async (q, s) => s.json(await pub.publicProject(q.params.username, q.params.id));
import { listThemes } from '../services/themeService.js';
export const themes = async (q, s) => s.json(await listThemes());
export const uploaded = (q, s) => q.file
  ? s.json({ url: '/uploads/' + q.file.filename })
  : s.status(400).json({ message: 'Please choose an image to upload' });
