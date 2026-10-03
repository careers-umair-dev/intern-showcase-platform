const bad = m => Object.assign(new Error(m), { status: 400 });
const hasOp = o => o && typeof o === 'object' && Object.entries(o).some(([k, v]) => k.startsWith('$') || hasOp(v));
export const sanitize = (q, s, n) => (hasOp(q.body) || hasOp(q.query) || hasOp(q.params) ? n(bad('Invalid input')) : n());
const url = v => !v || /^https?:\/\/\S+$/i.test(v), str = (v, max) => v == null || (typeof v === 'string' && v.length <= max);
export const validateProject = (q, s, n) => {
  const b = q.body;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return n(bad('Invalid project data'));
  if ((q.method === 'POST' || 'title' in b) && !String(b.title || '').trim()) return n(bad('Title is required'));
  if (!str(b.title, 120) || !str(b.summary, 300) || !str(b.description, 5000)) return n(bad('Title, summary or description is too long'));
  if (!url(b.repoUrl) || !url(b.demoUrl)) return n(bad('URLs must start with http:// or https://'));
  if ('status' in b && !['draft', 'published'].includes(b.status)) return n(bad('Invalid status'));
  for (const key of ['tags', 'images', 'features']) {
    if (key in b && (!Array.isArray(b[key]) || b[key].length > 20 || b[key].some(v => typeof v !== 'string'))) return n(bad(`Invalid ${key}`));
  }
  if ('featured' in b && typeof b.featured !== 'boolean') return n(bad('Invalid featured value'));
  if ('order' in b && (!Number.isFinite(b.order) || b.order < 0)) return n(bad('Invalid project order'));
  n();
};
export const validateProfile = (q, s, n) => {
  const b = q.body;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return n(bad('Invalid profile data'));
  if (!url(b.github) || !url(b.linkedin)) return n(bad('GitHub and LinkedIn must be full http(s) links'));
  if (!str(b.bio, 2000) || !str(b.headline, 140) || !str(b.name, 80) || !str(b.education, 1000) || !str(b.internship, 300) || !str(b.contact, 200) || !str(b.avatar, 2048)) return n(bad('A profile field is invalid or too long'));
  if ('name' in b && (typeof b.name !== 'string' || !b.name.trim())) return n(bad('Name is required'));
  if ('skills' in b && (!Array.isArray(b.skills) || b.skills.length > 50 || b.skills.some(v => typeof v !== 'string' || v.length > 60))) return n(bad('Invalid skills'));
  n();
};
export const validatePortfolio = (q, s, n) => {
  const b = q.body, sections = ['about', 'skills', 'projects', 'experience', 'achievements', 'contact'];
  if (!b || typeof b !== 'object' || Array.isArray(b)) return n(bad('Invalid portfolio data'));
  if ('published' in b && typeof b.published !== 'boolean') return n(bad('Invalid publish status'));
  if ('hero' in b && (!b.hero || typeof b.hero !== 'object' || Array.isArray(b.hero) ||
    !str(b.hero.title, 160) || !str(b.hero.subtitle, 300) || !str(b.hero.cover, 2048))) return n(bad('Invalid hero content'));
  if ('sections' in b && (!b.sections || typeof b.sections !== 'object' || Array.isArray(b.sections) ||
    Object.entries(b.sections).some(([key, value]) => !sections.includes(key) || typeof value !== 'boolean'))) return n(bad('Invalid portfolio sections'));
  if ('order' in b && (!Array.isArray(b.order) || b.order.length > sections.length ||
    b.order.some((key, index) => !sections.includes(key) || b.order.indexOf(key) !== index))) return n(bad('Invalid section order'));
  if ('experience' in b && (!Array.isArray(b.experience) || b.experience.length > 30 ||
    b.experience.some(item => !item || typeof item !== 'object' || Array.isArray(item) ||
      !str(item.role, 120) || !str(item.company, 120) || !str(item.period, 120) || !str(item.text, 2000)))) return n(bad('Invalid experience entries'));
  if ('achievements' in b && (!Array.isArray(b.achievements) || b.achievements.length > 50 ||
    b.achievements.some(item => !item || typeof item !== 'object' || Array.isArray(item) ||
      !str(item.title, 160) || !str(item.issuer, 160) || !str(item.year, 20)))) return n(bad('Invalid achievements'));
  if ('theme' in b) {
    const theme = b.theme;
    const options = {
      template: ['minimal', 'bold', 'split', 'classic', 'mono', 'sunset'],
      mode: ['light', 'dark'], font: ['sans', 'serif', 'mono'],
      btn: ['rounded', 'pill', 'square'], bg: ['plain', 'gradient', 'dots'], layout: ['grid', 'list'],
    };
    if (!theme || typeof theme !== 'object' || Array.isArray(theme) ||
      Object.entries(theme).some(([key, value]) => key === 'accent'
        ? typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)
        : !options[key]?.includes(value))) return n(bad('Invalid portfolio theme'));
  }
  n();
};
