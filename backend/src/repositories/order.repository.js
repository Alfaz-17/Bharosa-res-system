import prisma from '../config/prisma.js';

const ORDER_INCLUDE = {
  waiter: { select: { id: true, name: true, role: true } },
  order_items: {
    include: {
      menu_item: { select: { id: true, name: true } },
    },
  },
};

export const createOrder = (restaurantId, waiterId, data) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({
      data: {
        restaurant_id: restaurantId,
        waiter_id: waiterId,
        order_number: data.order_number,
        table_number: data.table_number,
        total_amount: data.total_amount,
        status: 'CREATED',
        order_items: {
          create: data.items.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price_snapshot: item.price_snapshot,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });

    await tx.orderEvents.create({
      data: {
        order_id: order.id,
        user_id: waiterId,
        event_type: 'ORDER_CREATED',
      },
    });

    return order;
  });
};

export const getOrders = (restaurantId, filters = {}) => {
  return prisma.orders.findMany({
    where: {
      restaurant_id: restaurantId,
      ...(filters.status && { status: filters.status }),
      ...(filters.waiter_id && { waiter_id: filters.waiter_id }),
    },
    include: ORDER_INCLUDE,
    orderBy: { created_at: 'desc' },
  });
};

export const getOrderById = (restaurantId, id) => {
  return prisma.orders.findFirst({
    where: { id, restaurant_id: restaurantId },
    include: {
      ...ORDER_INCLUDE,
      order_events: {
        orderBy: { timestamp: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
};

export const updateOrderStatus = (restaurantId, id, status, userId) => {
  const eventTypeMap = {
    CONFIRMED: 'ORDER_CONFIRMED',
    IN_KITCHEN: 'ORDER_IN_KITCHEN',
    READY: 'ORDER_READY',
    SERVED: 'ORDER_SERVED',
    PAID: 'ORDER_PAID',
    CANCELLED: null,
  };

  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });

    const eventType = eventTypeMap[status];
    if (eventType) {
      await tx.orderEvents.create({
        data: { order_id: id, user_id: userId, event_type: eventType },
      });
    }

    return order;
  });
};
