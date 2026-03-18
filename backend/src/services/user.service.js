import * as userRepo from '../repositories/user.repository.js';
import { hashPassword } from '../utils/hash.js';

export const getAll = (restaurantId) => {
  return userRepo.findAllByRestaurant(restaurantId);
};

export const create = async (restaurantId, data) => {
  const existing = await userRepo.findByEmail(restaurantId, data.email);
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const password_hash = await hashPassword(data.password);

  return userRepo.create({
    restaurant_id: restaurantId,
    name: data.name,
    email: data.email,
    password_hash,
    role: data.role,
  });
};

export const update = async (restaurantId, id, data) => {
  if (data.password) {
    data.password_hash = await hashPassword(data.password);
    delete data.password;
  }

  const updated = await userRepo.update(restaurantId, id, data);
  if (!updated) {
    throw new Error('User not found.');
  }
  return updated;
};

export const remove = async (restaurantId, id, currentUser) => {
  if (currentUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only a SUPER_ADMIN can delete users.');
  }
  
  if (id === currentUser.id) {
    throw new Error('You cannot delete your own account.');
  }

  const deleted = await userRepo.remove(restaurantId, id);
  if (!deleted) {
    throw new Error('User not found.');
  }
  return deleted;
};
