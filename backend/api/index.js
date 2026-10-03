import mongoose from 'mongoose';
import { app } from '../server.js';
import { seedThemes } from '../services/themeService.js';

let ready;

async function initialize() {
  if (!ready) {
    ready = mongoose.connect(process.env.MONGO_URI).then(seedThemes);
  }
  return ready;
}

export default async function handler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error('Database initialization failed:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }
}
