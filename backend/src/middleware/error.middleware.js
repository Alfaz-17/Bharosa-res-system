import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

/**
 * Global 4-argument error handler. Must be registered last in Express.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    user: req.user?.id,
  });

  // Prisma known errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists.', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired.', 401);
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : err.stack;
  return sendError(res, message, status);
};
