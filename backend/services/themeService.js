import { PortfolioTheme } from '../models/index.js';
const PRESETS = [
  { name: 'Clean Light', template: 'minimal', accent: '#6d5efc', mode: 'light', font: 'sans', btn: 'rounded', bg: 'plain', layout: 'grid' },
  { name: 'Midnight', template: 'bold', accent: '#22d3ee', mode: 'dark', font: 'sans', btn: 'pill', bg: 'gradient', layout: 'grid' },
  { name: 'Editorial', template: 'classic', accent: '#b4532a', mode: 'light', font: 'serif', btn: 'square', bg: 'plain', layout: 'list' },
  { name: 'Terminal', template: 'mono', accent: '#22c55e', mode: 'dark', font: 'mono', btn: 'square', bg: 'dots', layout: 'grid' },
  { name: 'Sunset', template: 'sunset', accent: '#e11d48', mode: 'light', font: 'sans', btn: 'pill', bg: 'gradient', layout: 'grid' },
];
export const seedThemes = async () => { if (!(await PortfolioTheme.countDocuments())) await PortfolioTheme.insertMany(PRESETS); };
export const listThemes = () => PortfolioTheme.find().sort({ name: 1 });
