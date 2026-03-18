import { z } from 'zod';
import * as restaurantService from '../services/restaurant.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
}).strict();

export const getSettings = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const result = await restaurantService.getSettings(restaurantId);
    return sendSuccess(res, result, 'Restaurant settings fetched successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const parsed = updateSettingsSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 422, parsed.error.errors);
    }

    const result = await restaurantService.updateSettings(restaurantId, parsed.data);
    return sendSuccess(res, result, 'Restaurant settings updated successfully.');
  } catch (err) {
    next(err);
  }
};
