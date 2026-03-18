import { z } from 'zod';
import * as menuService from '../services/menu.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  position: z.number().int().default(0),
  is_deleted: z.boolean().default(false),
});

export const itemSchema = z.object({
  category_id: z.string().min(1),
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  price: z.number().positive(),
  image_url: z.string().url().optional(),
  is_available: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
});

// ─── Category Handlers ────────────────────────────────────────────────────────

export const createCategory = async (req, res, next) => {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const data = await menuService.createCategory(req.restaurantId, parsed.data);
    return sendSuccess(res, data, 'Category created.', 201);
  } catch (err) { next(err); }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await menuService.getAllCategories(req.restaurantId);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getCategory = async (req, res, next) => {
  try {
    const data = await menuService.getCategoryById(req.restaurantId, req.params.id);
    if (!data) return sendError(res, 'Category not found.', 404);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const data = await menuService.updateCategory(req.restaurantId, req.params.id, parsed.data);
    return sendSuccess(res, data, 'Category updated.');
  } catch (err) { next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await menuService.deleteCategory(req.restaurantId, req.params.id);
    return sendSuccess(res, null, 'Category deleted.');
  } catch (err) { next(err); }
};

// ─── Item Handlers ────────────────────────────────────────────────────────────

export const createItem = async (req, res, next) => {
  try {
    const parsed = itemSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const data = await menuService.createItem(req.restaurantId, parsed.data);
    return sendSuccess(res, data, 'Item created.', 201);
  } catch (err) { next(err); }
};

export const getItems = async (req, res, next) => {
  try {
    const data = await menuService.getAllItems(req.restaurantId);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getItem = async (req, res, next) => {
  try {
    const data = await menuService.getItemById(req.restaurantId, req.params.id);
    if (!data) return sendError(res, 'Item not found.', 404);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateItem = async (req, res, next) => {
  try {
    const parsed = itemSchema.partial().safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const data = await menuService.updateItem(req.restaurantId, req.params.id, parsed.data);
    if (!data) return sendError(res, 'Item not found.', 404);
    return sendSuccess(res, data, 'Item updated.');
  } catch (err) { next(err); }
};

export const deleteItem = async (req, res, next) => {
  try {
    const data = await menuService.deleteItem(req.restaurantId, req.params.id);
    if (!data) return sendError(res, 'Item not found.', 404);
    return sendSuccess(res, null, 'Item deleted.');
  } catch (err) { next(err); }
};
