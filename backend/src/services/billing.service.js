import prisma from '../config/prisma.js';
import * as billingRepo from '../repositories/billing.repository.js';

export const generateInvoice = async (restaurantId, orderId) => {
  const existing = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  if (existing) return existing;

  const order = await prisma.orders.findFirst({
    where: { id: orderId, restaurant_id: restaurantId },
    include: { 
      order_items: true,
      restaurant: { select: { tax_rate: true } }
    },
  });

  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }
  if (order.status === 'CANCELLED') {
    const err = new Error('Cannot invoice a cancelled order.');
    err.status = 422;
    throw err;
  }

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + Number(item.price_snapshot) * item.quantity,
    0
  );
  const taxRate = Number(order.restaurant.tax_rate) / 100; // Assuming tax_rate is a percentage like 10.00
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return billingRepo.generateInvoice(orderId, { subtotal, tax, total });
};

export const createPayment = async (restaurantId, orderId, paymentData) => {
  const invoice = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  if (!invoice) {
    const err = new Error('Invoice not found. Generate invoice first.');
    err.status = 404;
    throw err;
  }

  const payment = await billingRepo.createPayment(invoice.id, paymentData);

  // Mark order as PAID if fully settled
  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(paymentData.amount);
  if (totalPaid >= Number(invoice.total)) {
    await prisma.orders.update({ where: { id: orderId }, data: { status: 'PAID' } });
  }

  return payment;
};

export const getInvoice = (restaurantId, orderId) => billingRepo.getInvoiceByOrderId(restaurantId, orderId);
