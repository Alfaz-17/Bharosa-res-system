import prisma from '../config/prisma.js';
import * as billingRepo from '../repositories/billing.repository.js';
import { publishOrderEvent } from '../events/order.events.js';

const mapInvoiceResponse = (invoice) => {
  if (!invoice) return null;
  return {
    ...invoice,
    tax_amount: Number(invoice.tax),
    discount_amount: Number(invoice.discount),
    total_amount: Number(invoice.total),
    subtotal: Number(invoice.subtotal),
    status: invoice.payments?.reduce((sum, p) => sum + Number(p.amount), 0) >= Number(invoice.total) ? 'PAID' : 'PENDING'
  };
};

export const generateInvoice = async (restaurantId, orderId, options = {}) => {
  const { discount = 0 } = options;
  const existing = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  if (existing) return mapInvoiceResponse(existing);

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
  const taxRate = Number(order.restaurant.tax_rate) / 100;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax - Number(discount)).toFixed(2));

  // Generate unique invoice number: INV-ORDNUMBER-RANDOM (PetPooja style)
  const invoice_number = `INV-${order.order_number}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  const invoice = await billingRepo.generateInvoice(orderId, { 
    invoice_number, 
    subtotal, 
    tax, 
    total,
    discount: Number(discount)
  });

  return mapInvoiceResponse(invoice);
};

export const createPayment = async (restaurantId, orderId, paymentData) => {
  const invoice = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  if (!invoice) {
    const err = new Error('Invoice not found. Generate invoice first.');
    err.status = 404;
    throw err;
  }

  const payment = await billingRepo.createPayment(invoice.id, paymentData);

  // Re-fetch invoice with payments to check status
  const updatedInvoice = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  const totalPaid = updatedInvoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  
  if (totalPaid >= Number(updatedInvoice.total)) {
    await prisma.orders.update({ where: { id: orderId }, data: { status: 'PAID' } });
    
    await publishOrderEvent('ORDER_UPDATED', {
      order_id: orderId,
      status: 'PAID',
      restaurant_id: restaurantId,
    });
  }

  return payment;
};

export const getInvoice = async (restaurantId, orderId) => {
  const invoice = await billingRepo.getInvoiceByOrderId(restaurantId, orderId);
  return mapInvoiceResponse(invoice);
};
