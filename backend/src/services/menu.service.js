import * as menuRepo from '../repositories/menu.repository.js';

export const createCategory = (restaurantId, data) => menuRepo.createCategory(restaurantId, data);
export const getAllCategories = (restaurantId) => menuRepo.getAllCategories(restaurantId);
export const getCategoryById = (restaurantId, id) => menuRepo.getCategoryById(restaurantId, id);
export const updateCategory = (restaurantId, id, data) => menuRepo.updateCategory(restaurantId, id, data);
export const deleteCategory = (restaurantId, id) => menuRepo.softDeleteCategory(restaurantId, id);

export const createItem = async (restaurantId, data) => {
  // Verify category belongs to restaurant
  const category = await menuRepo.getCategoryById(restaurantId, data.category_id);
  if (!category) {
    const err = new Error('Category not found or does not belong to this restaurant.');
    err.status = 404;
    throw err;
  }
  return menuRepo.createItem({ ...data, restaurant_id: restaurantId });
};

export const getAllItems = (restaurantId) => menuRepo.getAllItems(restaurantId);
export const getItemById = (restaurantId, id) => menuRepo.getItemById(restaurantId, id);
export const updateItem = (restaurantId, id, data) => menuRepo.updateItem(restaurantId, id, data);
export const deleteItem = (restaurantId, id) => menuRepo.softDeleteItem(restaurantId, id);
