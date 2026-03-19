import prisma from '../config/prisma.js';

export const getTables = async (restaurantId) => {
  return prisma.tables.findMany({
    where: { restaurant_id: restaurantId },
    orderBy: { table_number: 'asc' },
  });
};

export const createTable = async (data) => {
  return prisma.tables.create({
    data,
  });
};

export const deleteTable = async (restaurantId, id) => {
  return prisma.tables.delete({
    where: { id, restaurant_id: restaurantId },
  });
};

export const getTableByNumber = async (restaurantId, tableNumber) => {
  return prisma.tables.findUnique({
    where: {
      restaurant_id_table_number: {
        restaurant_id: restaurantId,
        table_number: tableNumber,
      },
    },
  });
};
