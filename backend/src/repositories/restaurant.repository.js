import prisma from '../config/prisma.js';

export const getRestaurantById = async (id) => {
  return prisma.restaurant.findUnique({
    where: { id },
  });
};

export const updateRestaurant = async (id, data) => {
  return prisma.restaurant.update({
    where: { id },
    data,
  });
};
