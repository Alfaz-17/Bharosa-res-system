import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * @param {{ id: string, role: string, restaurant_id: string }} payload
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * @param {{ id: string }} payload
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * @param {string} token
 * @returns {{ id: string, role: string, restaurant_id: string }}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

/**
 * @param {string} token
 * @returns {{ id: string }}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};
