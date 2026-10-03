import { Router } from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import { OAuth2Client } from 'google-auth-library';
import { User, Portfolio } from '../models/index.js'; import { validateProfile } from '../middleware/validate.js'; import { auth, wrap } from '../middleware/auth.js';
const r = Router(); const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const bad = m => Object.assign(new Error(m), { status: 400 });
const oauthClient = new OAuth2Client();
const safeUser = u => {
  const data = u.toObject();
  const hasPassword = Boolean(data.password);
  delete data.password;
  delete data.googleSub;
  return { ...data, hasPassword };
};
async function availableUsername(email) {
  const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 26);
  const base = local.length >= 3 ? local : `user${local}`;
  for (let suffix = 0; suffix < 10000; suffix++) {
    const ending = suffix ? String(suffix + 1) : '';
    const username = `${base.slice(0, 30 - ending.length)}${ending}`;
    if (!(await User.exists({ username }))) return username;
  }
  throw Object.assign(new Error('Could not create a username. Please try again.'), { status: 503 });
}
async function googleAccount(payload) {
  const email = payload.email.trim().toLowerCase();
  let user = await User.findOne({ googleSub: payload.sub }).select('+googleSub +password');
  if (!user) {
    user = await User.findOne({ email }).select('+googleSub +password');
    if (user?.googleSub && user.googleSub !== payload.sub) {
      throw Object.assign(new Error('This email is linked to a different Google account'), { status: 409 });
    }
    if (user) {
      user.googleSub = payload.sub;
      await user.save();
    } else {
      try {
        user = await User.create({
          name: (typeof payload.name === 'string' ? payload.name.trim() : '') || email.split('@')[0],
          email,
          username: await availableUsername(email),
          googleSub: payload.sub,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        user = await User.findOne({ $or: [{ email }, { googleSub: payload.sub }] }).select('+googleSub +password');
        if (!user || (user.googleSub && user.googleSub !== payload.sub)) throw error;
        user.googleSub = payload.sub;
        await user.save();
      }
    }
  }
  await Portfolio.updateOne(
    { user: user._id },
    { $setOnInsert: { user: user._id, hero: { title: `Hi, I'm ${user.name}`, subtitle: 'Intern & aspiring developer' } } },
    { upsert: true },
  );
  return user;
}
r.get('/google/config', (q, s) => s.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' }));
r.post('/google', wrap(async (q, s) => {
  if (!process.env.GOOGLE_CLIENT_ID) throw Object.assign(new Error('Google sign-in is not configured'), { status: 503 });
  const credential = q.body?.credential;
  if (typeof credential !== 'string' || !credential || credential.length > 10000) throw bad('Invalid Google credential');
  let ticket;
  try {
    ticket = await oauthClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  } catch {
    throw Object.assign(new Error('Google sign-in could not be verified. Please try again.'), { status: 401 });
  }
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw Object.assign(new Error('Use a Google account with a verified email address'), { status: 401 });
  }
  const user = await googleAccount(payload);
  s.json({ token: sign(user), user: safeUser(user) });
}));
r.post('/register', wrap(async (q, s) => {
  const body = q.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!name) throw bad('Please enter your name');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad('Please enter a valid email address');
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) throw bad('Username must be 3-30 letters/numbers (underscores and hyphens are also allowed)');
  if (password.length < 8) throw bad('Password must be at least 8 characters');
  const u = await User.create({ name, email, username, password: await bcrypt.hash(password, 10) });
  await Portfolio.create({ user: u._id, hero: { title: `Hi, I'm ${name}`, subtitle: 'Intern & aspiring developer' } });
  s.status(201).json({ token: sign(u), user: safeUser(await User.findById(u._id).select('+password')) });
}));
r.post('/login', wrap(async (q, s) => {
  const email = typeof q.body?.email === 'string' ? q.body.email.trim().toLowerCase() : '';
  const password = typeof q.body?.password === 'string' ? q.body.password : '';
  const u = await User.findOne({ email }).select('+password');
  if (!u || !u.password || !(await bcrypt.compare(password, u.password))) throw Object.assign(new Error('Wrong email or password'), { status: 401 });
  s.json({ token: sign(u), user: safeUser(u) });
}));
r.get('/me', auth, wrap(async (q, s) => s.json(safeUser(await User.findById(q.uid).select('+password')))));
r.put('/me', auth, validateProfile, wrap(async (q, s) => {
  const { password, googleSub, hasPassword, email, username, _id, ...f } = q.body; await User.updateOne({ _id: q.uid }, f); s.json(safeUser(await User.findById(q.uid).select('+password')));
}));
r.put('/password', auth, wrap(async (q, s) => {
  const u = await User.findById(q.uid).select('+password');
  if (!u) throw Object.assign(new Error('Account not found'), { status: 404 });
  const current = typeof q.body?.current === 'string' ? q.body.current : '';
  const next = typeof q.body?.next === 'string' ? q.body.next : '';
  if (u.password && !(await bcrypt.compare(current, u.password))) throw bad('Current password is wrong');
  if (next.length < 8) throw bad('New password needs 8+ characters');
  u.password = await bcrypt.hash(next, 10); await u.save(); s.json({ ok: true });
}));
export default r;
