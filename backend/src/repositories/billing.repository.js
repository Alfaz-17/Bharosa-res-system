import prisma from '../config/prisma.js';

export const getInvoiceByOrderId = (restaurantId, orderId) => {
  return prisma.invoices.findFirst({
    where: { order: { id: orderId, restaurant_id: restaurantId } },
    include: { payments: true, order: true },
  });
};

export const generateInvoice = (orderId, { invoice_number, subtotal, tax, total, discount }) => {
  return prisma.invoices.create({
    data: { 
      order_id: orderId, 
      invoice_number, 
      subtotal, 
      tax, 
      total, 
      discount: discount || 0 
    },
  });
};

export const createPayment = (invoiceId, { method, amount, reference }) => {
  return prisma.payments.create({
    data: { invoice_id: invoiceId, method, amount, reference },
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getRevenueByDateRange = (restaurantId, from, to) => {
  return prisma.invoices.aggregate({
    where: {
      order: { restaurant_id: restaurantId, status: 'PAID' },
      created_at: { gte: from, lte: to },
    },
    _sum: { total: true },
    _count: true,
  });
};

export const getTopItems = (restaurantId, limit = 10) => {
  return prisma.orderItems.groupBy({
    by: ['menu_item_id'],
    where: { order: { restaurant_id: restaurantId, status: 'PAID' } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });
};

export const getOrderTrendsByDay = (restaurantId, from, to) => {
  // Raw query for date truncation (Prisma groupBy doesn't natively support date parts)
  return prisma.$queryRaw`
    SELECT
      DATE("created_at") AS date,
      COUNT(*)::int       AS order_count,
      SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END)::int AS paid_count,
      SUM(total_amount)::float AS revenue
    FROM "Orders"
    WHERE "restaurant_id" = ${restaurantId}
      AND "created_at" >= ${from}
      AND "created_at" <= ${to}
    GROUP BY DATE("created_at")
    ORDER BY DATE("created_at") ASC
  `;
};
