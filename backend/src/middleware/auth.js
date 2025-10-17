import { verifyToken } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}
