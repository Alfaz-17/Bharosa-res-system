import { sendError } from '../utils/response.js';

/**
 * Creates a middleware that validates `req.body` against a Zod schema.
 * Returns 422 Unprocessable Entity on validation failure.
 *
 * @param {import('zod').ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorList = result.error.issues || result.error.errors || [];
    const errors = errorList.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({ success: false, message: 'Validation failed.', bodyDump: req.body, headersDump: req.headers, errors });
  }

  req.body = result.data; // use the parsed (and potentially coerced) data
  next();
};
