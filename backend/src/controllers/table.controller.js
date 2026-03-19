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

export const checkTable = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    // For now, we use a single restaurant model if not sub-domained
    // If multiple restaurants, we would need to know WHICH restaurant.
    // Assuming single restaurant for now or first one found.
    const tables = await tableService.getTables(); // This gets all tables across all? No, it expects restaurantId.
    // Let's assume restaurantId is 1 or we search across all.
    // Actually, the repo has getTableByNumber(restaurantId, tableNumber)
    // For a simple POS, it's often 1 restaurant.
    const table = await tableService.getTableByNumber(undefined, tableNumber); 
    
    if (!table) {
      return sendError(res, 'Table not found', 404);
    }
    
    return sendSuccess(res, table, 'Table is valid.');
  } catch (err) {
    next(err);
  }
};
