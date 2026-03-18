import { sendError } from '../utils/response.js';

/**
 * Confirms `req.user.restaurant_id` is present and attaches it to `req`
 * as a top-level convenience property for downstream use.
 *
 * Must be used AFTER `authenticate`.
 */
export const tenantGuard = (req, res, next) => {
  const restaurantId = req.user?.restaurant_id;

  if (!restaurantId) {
    return sendError(res, 'Tenant context is missing. Please log in again.', 401);
  }

  req.restaurantId = restaurantId;
  next();
};
