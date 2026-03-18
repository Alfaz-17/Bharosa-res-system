import prisma from '../config/prisma.js';

export const findById = (restaurantId, id) => {
  return prisma.users.findFirst({
    where: { id, restaurant_id: restaurantId },
    select: { id: true, name: true, email: true, role: true, restaurant_id: true, created_at: true },
  });
};

export const findByEmail = (restaurantId, email) => {
  return prisma.users.findFirst({
    where: { email, restaurant_id: restaurantId },
  });
};

export const findAllByRestaurant = (restaurantId) => {
  return prisma.users.findMany({
    where: { restaurant_id: restaurantId },
    select: { id: true, name: true, email: true, role: true, created_at: true },
    orderBy: { created_at: 'desc' },
  });
};

export const create = (data) => {
  return prisma.users.create({
    data,
    select: { id: true, name: true, email: true, role: true, restaurant_id: true, created_at: true },
  });
};

export const update = (restaurantId, id, data) => {
  // Use updateMany for scoping safety, though it returns a batch payload
  return prisma.$transaction(async (tx) => {
    const user = await tx.users.findFirst({ where: { id, restaurant_id: restaurantId } });
    if (!user) return null;
    return tx.users.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });
  });
};

export const remove = (restaurantId, id) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.users.findFirst({ where: { id, restaurant_id: restaurantId } });
    if (!user) return null;
    return tx.users.delete({
      where: { id },
    });
  });
};
