import { z } from 'zod';
import * as tableService from '../services/table.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const tableSchema = z.object({
  table_number: z.string().min(1),
  is_active: z.boolean().optional(),
});

export const getTables = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const tables = await tableService.getTables(restaurantId);
    return sendSuccess(res, tables, 'Tables fetched successfully.');
  } catch (err) {
    next(err);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const parsed = tableSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 422, parsed.error.errors);
    }

    const table = await tableService.createTable(restaurantId, parsed.data);
    return sendSuccess(res, table, 'Table created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const restaurantId = req.restaurantId;
    const { id } = req.params;
    await tableService.deleteTable(restaurantId, id);
    return sendSuccess(res, null, 'Table deleted successfully.');
  } catch (err) {
    next(err);
  }
};
