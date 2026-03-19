import { z } from 'zod';
import * as analyticsService from '../services/analytics.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { toCSV } from '../utils/csv.js';

const dateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

const parseRange = (req, res) => {
  const parsed = dateRangeSchema.safeParse({
    from: req.query.from,
    to: req.query.to,
  });
  if (!parsed.success) {
    sendError(res, 'Provide `from` and `to` as ISO 8601 datetime strings.', 422, parsed.error.errors);
    return null;
  }
  return { from: new Date(parsed.data.from), to: new Date(parsed.data.to) };
};

export const getRevenue = async (req, res, next) => {
  try {
    const range = parseRange(req, res);
    if (!range) return;
    const data = await analyticsService.getRevenue(req.restaurantId, range.from, range.to);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getTopItems = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit ?? '10', 10);
    const data = await analyticsService.getTopItems(req.restaurantId, limit);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getOrderTrends = async (req, res, next) => {
  try {
    const range = parseRange(req, res);
    if (!range) return;
    const data = await analyticsService.getOrderTrends(req.restaurantId, range.from, range.to);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const exportReport = async (req, res, next) => {
  try {
    const range = parseRange(req, res);
    if (!range) return;
    
    const trends = await analyticsService.getOrderTrends(req.restaurantId, range.from, range.to);
    const csv = toCSV(trends, ['date', 'order_count', 'revenue']);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics_report.csv');
    return res.status(200).send(csv);
  } catch (err) { next(err); }
};
