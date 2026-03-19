import prisma from '../config/prisma.js';
import * as billingRepo from '../repositories/billing.repository.js';

export const getRevenue = async (restaurantId, from, to) => {
  const stats = await billingRepo.getRevenueByDateRange(restaurantId, from, to);
  const total_revenue = Number(stats._sum?.total || 0);
  const order_count = stats._count || 0;
  const average_order_value = order_count > 0 ? total_revenue / order_count : 0;
  
  return {
    from,
    to,
    total_revenue,
    order_count,
    average_order_value
  };
};

export const getTopItems = async (restaurantId, limit = 10) => {
  const topItems = await billingRepo.getTopItems(restaurantId, limit);
  
  const enhancedItems = await Promise.all(topItems.map(async (item) => {
    const menuItem = await prisma.menuItems.findUnique({
      where: { id: item.menu_item_id },
      include: { category: true }
    });
    return {
      item_name: menuItem?.name || 'Unknown',
      category_name: menuItem?.category?.name || 'General',
      total_quantity: Number(item._sum.quantity),
      total_revenue: Number(item._sum.quantity) * Number(menuItem?.price || 0)
    };
  }));
  
  return enhancedItems;
};

export const getOrderTrends = async (restaurantId, from, to) => {
  const trends = await billingRepo.getOrderTrendsByDay(restaurantId, from, to);
  
  return trends.map(t => ({
    date: t.date,
    order_count: Number(t.order_count),
    revenue: Number(t.revenue || 0)
  }));
};
