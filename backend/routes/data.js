import { Router } from 'express'; import { auth, wrap as w } from '../middleware/auth.js'; import { validatePortfolio, validateProject } from '../middleware/validate.js'; import { upload } from '../middleware/upload.js';
import * as P from '../controllers/projectController.js'; import * as F from '../controllers/portfolioController.js';
const r = Router();
r.post('/upload', auth, upload.single('file'), F.uploaded);
r.get('/projects', auth, w(P.list)); r.post('/projects', auth, validateProject, w(P.create));
r.put('/projects/:id', auth, validateProject, w(P.update)); r.delete('/projects/:id', auth, w(P.remove)); r.post('/projects/:id/duplicate', auth, w(P.duplicate));
r.get('/portfolio', auth, w(F.mine)); r.put('/portfolio', auth, validatePortfolio, w(F.save)); r.get('/stats', auth, w(F.getStats));
r.get('/themes', w(F.themes)); r.get('/public/:username', w(F.page)); r.get('/public/:username/projects/:id', w(F.project));
export default r;
