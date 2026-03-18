/**
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [status]
 */
export const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * @param {import('express').Response} res
 * @param {string} [message]
 * @param {number} [status]
 * @param {*} [errors]
 */
export const sendError = (res, message = 'An error occurred', status = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
