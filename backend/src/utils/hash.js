import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

/**
 * Hashes a plaintext password.
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = (password) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};
