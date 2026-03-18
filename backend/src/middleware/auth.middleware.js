import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

/**
 * Verifies the Bearer token from the Authorization header.
 * Attaches the decoded payload to `req.user` on success.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authorization token required.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { id, role, restaurant_id }
    next();
  } catch {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

/**
 * Role-based access control guard.
 * @param {...string} roles - Allowed roles (e.g. 'ADMIN', 'MANAGER')
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'You do not have permission to perform this action.', 403);
  }

  // SUPER_ADMIN has god-mode across all endpoints
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!roles.includes(req.user.role)) {
    return sendError(res, 'You do not have permission to perform this action.', 403);
  }
  
  next();
};
