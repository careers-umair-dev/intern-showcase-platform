import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = n => ({ type: Schema.Types.ObjectId, ref: n });
export const User = model('User', new Schema({
  name: String, email: { type: String, unique: true, lowercase: true }, username: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false }, googleSub: { type: String, unique: true, sparse: true, select: false }, headline: String, bio: String, avatar: String, skills: [String],
  education: String, internship: String, contact: String, github: String, linkedin: String }, { timestamps: true }));
export const Project = model('Project', new Schema({
  user: ref('User'), title: { type: String, required: true }, summary: String, description: String, thumbnail: String, images: [String],
  tags: [String], category: String, repoUrl: String, demoUrl: String, features: [String], challenges: String, solutions: String,
  duration: String, team: String, role: String, featured: Boolean, status: { type: String, default: 'draft' }, order: { type: Number, default: 0 } }, { timestamps: true }));
export const Portfolio = model('Portfolio', new Schema({
  user: { ...ref('User'), unique: true }, published: { type: Boolean, default: false },
  hero: { title: String, subtitle: String, cover: String },
  sections: { type: Object, default: { about: true, skills: true, projects: true, experience: true, contact: true } },
  experience: [{ role: String, company: String, period: String, text: String }],
  achievements: [{ title: String, issuer: String, year: String }], order: [String],
  theme: { type: Object, default: { template: 'minimal', accent: '#6d5efc', mode: 'light' } } }));
export const Analytics = model('Analytics', new Schema({ user: ref('User'), type: String, project: ref('Project') }, { timestamps: true }));
export const PortfolioTheme = model('PortfolioTheme', new Schema({ name: { type: String, unique: true }, template: String, accent: String, mode: String, font: String, btn: String, bg: String, layout: String }));
