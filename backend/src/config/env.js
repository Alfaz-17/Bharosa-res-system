import 'dotenv/config';

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key, fallback = '') => process.env[key] ?? fallback;

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),

  DATABASE_URL: required('DATABASE_URL'),

  ACCESS_TOKEN_SECRET: required('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: required('REFRESH_TOKEN_SECRET'),
  ACCESS_TOKEN_EXPIRY: optional('ACCESS_TOKEN_EXPIRY', '15m'),
  REFRESH_TOKEN_EXPIRY: optional('REFRESH_TOKEN_EXPIRY', '7d'),

  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),

  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET'),
};
