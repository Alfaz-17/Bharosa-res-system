import { z } from 'zod';
import * as orderService from '../services/order.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const orderItemSchema = z.object({
  menu_item_id: z.string().min(1),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  table_number: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_KITCHEN', 'READY', 'SERVED', 'PAID', 'CANCELLED']),
});

export const createOrder = async (req, res, next) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const order = await orderService.createOrder(req.restaurantId, req.user.id, parsed.data);
    return sendSuccess(res, order, 'Order created.', 201);
  } catch (err) { next(err); }
};

export const getOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      waiter_id: req.query.waiter_id,
    };
    const orders = await orderService.getOrders(req.restaurantId, filters);
    return sendSuccess(res, orders);
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.restaurantId, req.params.id);
    return sendSuccess(res, order);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed.', 422, parsed.error.errors);
    const order = await orderService.updateOrderStatus(
      req.restaurantId,
      req.params.id,
      parsed.data.status,
      req.user.id
    );
    return sendSuccess(res, order, 'Order status updated.');
  } catch (err) { next(err); }
};
