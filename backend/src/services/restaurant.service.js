import * as restaurantRepo from '../repositories/restaurant.repository.js';

export const getSettings = async (restaurantId) => {
  const restaurant = await restaurantRepo.getRestaurantById(restaurantId);
  if (!restaurant) {
    const err = new Error('Restaurant not found');
    err.status = 404;
    throw err;
  }
  return restaurant;
};

export const updateSettings = async (restaurantId, updateData) => {
  const restaurant = await restaurantRepo.getRestaurantById(restaurantId);
  if (!restaurant) {
    const err = new Error('Restaurant not found');
    err.status = 404;
    throw err;
  }
  return restaurantRepo.updateRestaurant(restaurantId, updateData);
};
