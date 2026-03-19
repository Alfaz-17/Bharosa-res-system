import prisma from '../config/prisma.js';
import * as orderRepo from '../repositories/order.repository.js';
import { publishOrderEvent } from '../events/order.events.js';

// Valid forward-only status transitions
const TRANSITIONS = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_KITCHEN', 'CANCELLED'],
  IN_KITCHEN: ['READY'],
  READY: ['SERVED'],
  SERVED: ['PAID'],
};

export const createOrder = async (restaurantId, waiterId, body) => {
  // Validate Table
  const table = await prisma.tables.findFirst({
    where: { 
      restaurant_id: restaurantId, 
      table_number: body.table_number.toString(), 
      is_active: true 
    }
  });

  if (!table) {
    const err = new Error(`Table ${body.table_number} is not valid or active.`);
    err.status = 422;
    throw err;
  }

  // Fetch menu items + snapshot prices
  const menuItemIds = body.items.map((i) => i.menu_item_id);
  const menuItems = await prisma.menuItems.findMany({
    where: {
      id: { in: menuItemIds },
      category: { restaurant_id: restaurantId },
      is_available: true,
    },
  });

  if (menuItems.length !== menuItemIds.length) {
    const err = new Error('One or more menu items are unavailable or not found.');
    err.status = 422;
    throw err;
  }

  const priceMap = Object.fromEntries(menuItems.map((m) => [m.id, Number(m.price)]));
  
  let totalAmount = 0;
  const itemsWithSnapshot = body.items.map((item) => {
    const snapshotPrice = priceMap[item.menu_item_id];
    totalAmount += snapshotPrice * item.quantity;
    return {
      ...item,
      price_snapshot: snapshotPrice,
    };
  });

  // Generate a random 6 character order number (e.g. ORD-A1B2C3)
  const orderNumber = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  console.log('DEBUG: Creating order in repository', { restaurantId, waiterId, orderNumber, totalAmount });
  
  const order = await orderRepo.createOrder(restaurantId, waiterId, {
    ...body,
    order_number: orderNumber,
    total_amount: totalAmount,
    items: itemsWithSnapshot,
  });

  await publishOrderEvent('ORDER_CREATED', {
    order_id: order.id,
    order_number: order.order_number,
    restaurant_id: restaurantId,
  });

  return order;
};

export const getOrders = (restaurantId, filters) => orderRepo.getOrders(restaurantId, filters);

export const getOrderById = async (restaurantId, id) => {
  const order = await orderRepo.getOrderById(restaurantId, id);
  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }
  return order;
};

export const updateOrderStatus = async (restaurantId, id, newStatus, userId) => {
  const order = await orderRepo.getOrderById(restaurantId, id);
  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }

  if (order.status === newStatus) {
    return order;
  }

  const allowed = TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    err.status = 400;
    throw err;
  }

  const updated = await orderRepo.updateOrderStatus(restaurantId, id, newStatus, userId);

  await publishOrderEvent('ORDER_UPDATED', {
    order_id: id,
    status: newStatus,
    restaurant_id: restaurantId,
  });

  if (newStatus === 'READY') {
    await publishOrderEvent('ORDER_READY', {
      order_id: id,
      restaurant_id: restaurantId,
    });
  }

  return updated;
};
