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

// 可选鉴权：如有合法 token 则注入 req.user；无 token 不拦截。
export function authenticateTokenOptional(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  try {
    req.user = verifyToken(token);
  } catch (_error) {
    // 忽略错误，继续以匿名身份处理
  }
  next();
}
