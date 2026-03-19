import { z } from 'zod';
import * as userService from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAITER', 'KITCHEN']),
  is_active: z.boolean().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll(req.restaurantId);
    return sendSuccess(res, users);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    
    const user = await userService.create(req.restaurantId, parsed.data);
    return sendSuccess(res, user, 'User created successfully.', 201);
  } catch (err) { 
    if (err.message === 'User with this email already exists.') {
      err.status = 409;
    }
    next(err); 
  }
};

export const update = async (req, res, next) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);

    const user = await userService.update(req.restaurantId, req.params.id, parsed.data);
    return sendSuccess(res, user, 'User updated successfully.');
  } catch (err) { 
    if (err.message === 'User not found.') err.status = 404;
    next(err); 
  }
};

export const remove = async (req, res, next) => {
  try {
    await userService.remove(req.restaurantId, req.params.id, req.user);
    return sendSuccess(res, null, 'User deleted successfully.');
  } catch (err) {
    if (err.message === 'Only a SUPER_ADMIN can delete users.') {
      err.status = 403;
    }
    if (err.message === 'You cannot delete your own account.') {
      err.status = 400;
    }
    if (err.message === 'User not found.') {
      err.status = 404;
    }
    next(err);
  }
};
