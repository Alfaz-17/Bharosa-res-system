import * as tableRepo from '../repositories/table.repository.js';

export const getTables = async (restaurantId) => {
  return tableRepo.getTables(restaurantId);
};

export const createTable = async (restaurantId, tableData) => {
  // Check if table already exists
  const existing = await tableRepo.getTableByNumber(restaurantId, tableData.table_number);
  if (existing) {
    const err = new Error('Table number already exists');
    err.status = 422;
    throw err;
  }

  return tableRepo.createTable({
    ...tableData,
    restaurant_id: restaurantId,
  });
};

export const deleteTable = async (restaurantId, id) => {
  return tableRepo.deleteTable(restaurantId, id);
};

export const getTableByNumber = async (restaurantId, tableNumber) => {
  return tableRepo.getTableByNumber(restaurantId, tableNumber);
};
