import prisma from '../config/prisma.js';

// ─── Categories ───────────────────────────────────────────────────────────────

export const createCategory = (restaurantId, data) => {
  return prisma.menuCategories.create({
    data: { ...data, restaurant_id: restaurantId },
  });
};

export const getAllCategories = (restaurantId) => {
  return prisma.menuCategories.findMany({
    where: { restaurant_id: restaurantId, is_deleted: false },
    orderBy: { position: 'asc' },
    include: { menu_items: { where: { is_available: true, is_deleted: false } } },
  });
};

export const getCategoryById = (restaurantId, id) => {
  return prisma.menuCategories.findFirst({
    where: { id, restaurant_id: restaurantId, is_deleted: false },
    include: { menu_items: { where: { is_deleted: false } } },
  });
};

export const updateCategory = (restaurantId, id, data) => {
  return prisma.menuCategories.updateMany({
    where: { id, restaurant_id: restaurantId },
    data,
  });
};

export const softDeleteCategory = (restaurantId, id) => {
  return prisma.menuCategories.updateMany({
    where: { id, restaurant_id: restaurantId },
    data: { is_deleted: true },
  });
};

// ─── Items ────────────────────────────────────────────────────────────────────

export const createItem = (data) => {
  return prisma.menuItems.create({ data });
};

export const getAllItems = (restaurantId) => {
  return prisma.menuItems.findMany({
    where: { category: { restaurant_id: restaurantId }, is_deleted: false },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
};

export const getItemById = (restaurantId, id) => {
  return prisma.menuItems.findFirst({
    where: { id, category: { restaurant_id: restaurantId }, is_deleted: false },
    include: { category: true },
  });
};

export const updateItem = (restaurantId, id, data) => {
  return prisma.$transaction(async (tx) => {
    const item = await tx.menuItems.findFirst({
      where: { id, category: { restaurant_id: restaurantId } },
    });
    if (!item) return null;
    return tx.menuItems.update({ where: { id }, data });
  });
};

export const softDeleteItem = (restaurantId, id) => {
  return prisma.$transaction(async (tx) => {
    const item = await tx.menuItems.findFirst({
      where: { id, category: { restaurant_id: restaurantId } },
    });
    if (!item) return null;
    return tx.menuItems.update({ where: { id }, data: { is_deleted: true } });
  });
};
