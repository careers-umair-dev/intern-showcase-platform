import jwt from 'jsonwebtoken';
export const auth = (req, res, next) => {
  try { req.uid = jwt.verify((req.headers.authorization || '').slice(7), process.env.JWT_SECRET).id; next(); }
  catch { res.status(401).json({ message: 'Please log in again' }); }
};
export const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
export const errors = (e, req, res, next) => res.status(e.status || (e.name === 'MulterError' || e.name === 'ValidationError' ? 400 : e.code === 11000 ? 409 : 500)).json({ message: e.code === 11000 ? 'Email or username already taken' : e.message });
