import * as billingRepo from '../repositories/billing.repository.js';

export const getRevenue = async (restaurantId, from, to) => {
  return billingRepo.getRevenueByDateRange(restaurantId, from, to);
};

export const getTopItems = async (restaurantId, limit = 10) => {
  return billingRepo.getTopItems(restaurantId, limit);
};

export const getOrderTrends = async (restaurantId, from, to) => {
  return billingRepo.getOrderTrendsByDay(restaurantId, from, to);
};
