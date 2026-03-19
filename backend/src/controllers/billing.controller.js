import { z } from 'zod';
import * as billingService from '../services/billing.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'UPI']),
  amount: z.number().positive(),
  reference: z.string().optional(),
});

export const generateInvoice = async (req, res, next) => {
  try {
    const { discount } = req.body || {};
    const invoice = await billingService.generateInvoice(req.restaurantId, req.params.orderId, { discount });
    return sendSuccess(res, invoice, 'Invoice generated.', 201);
  } catch (err) { next(err); }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await billingService.getInvoice(req.restaurantId, req.params.orderId);
    if (!invoice) return sendError(res, 'Invoice not found.', 404);
    return sendSuccess(res, invoice);
  } catch (err) { next(err); }
};

export const createPayment = async (req, res, next) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const payment = await billingService.createPayment(req.restaurantId, req.params.orderId, parsed.data);
    return sendSuccess(res, payment, 'Payment recorded.', 201);
  } catch (err) { next(err); }
};
