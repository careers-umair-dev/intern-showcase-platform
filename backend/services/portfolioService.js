import { User, Portfolio, Project, Analytics } from '../models/index.js';
export const notFound = () => Object.assign(new Error('Not found'), { status: 404 });
async function findLive(name) { const u = await User.findOne({ username: String(name).toLowerCase() }).select('-email -createdAt -updatedAt'); const pf = u && await Portfolio.findOne({ user: u._id, published: true }); if (!pf) throw notFound(); return [u, pf]; }
export async function publicPortfolio(name) {
  const [user, portfolio] = await findLive(name); Analytics.create({ user: user._id, type: 'portfolio' }).catch(e => console.error('Failed to record portfolio view:', e.message));
  return { user, portfolio, projects: await Project.find({ user: user._id, status: 'published' }).sort({ featured: -1, order: 1 }) };
}
export async function publicProject(name, id) {
  const [user, portfolio] = await findLive(name); const project = await Project.findOne({ _id: id, user: user._id, status: 'published' }); if (!project) throw notFound();
  Analytics.create({ user: user._id, type: 'project', project: project._id }).catch(e => console.error('Failed to record project view:', e.message)); return { user, portfolio, project };
}
export const publishedUsernames = async () => (await User.find({ _id: { $in: await Portfolio.find({ published: true }).distinct('user') } }).select('username updatedAt'));
