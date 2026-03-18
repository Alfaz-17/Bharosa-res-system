import prisma from '../config/prisma.js';
import { comparePassword } from '../utils/hash.js';
import { hashPassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const login = async ({ email, password, ipAddress, deviceInfo }) => {
  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
    restaurant_id: user.restaurant_id,
  });
  const refreshToken = generateRefreshToken({ id: user.id });
  const hashedRefresh = await hashPassword(refreshToken);

  // Persist session
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.userSessions.create({
    data: {
      user_id: user.id,
      refresh_token_hash: hashedRefresh,
      ip_address: ipAddress || null,
      device_info: deviceInfo || null,
      expires_at: expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurant_id: user.restaurant_id,
    },
  };
};

export const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token.');
    err.status = 401;
    throw err;
  }

  // Find all active sessions for this user and find the matching one
  const sessions = await prisma.userSessions.findMany({
    where: { user_id: payload.id, expires_at: { gt: new Date() } },
  });

  let matchedSession = null;
  for (const session of sessions) {
    const match = await comparePassword(refreshToken, session.refresh_token_hash);
    if (match) { matchedSession = session; break; }
  }

  if (!matchedSession) {
    const err = new Error('Session not found or expired.');
    err.status = 401;
    throw err;
  }

  const user = await prisma.users.findUnique({ where: { id: payload.id } });
  if (!user) {
    const err = new Error('User not found.');
    err.status = 401;
    throw err;
  }

  // Rotate tokens
  const newAccessToken = generateAccessToken({
    id: user.id,
    role: user.role,
    restaurant_id: user.restaurant_id,
  });
  const newRefreshToken = generateRefreshToken({ id: user.id });
  const hashedNew = await hashPassword(newRefreshToken);

  // Delete old session and insert new one
  await prisma.userSessions.delete({ where: { id: matchedSession.id } });
  await prisma.userSessions.create({
    data: {
      user_id: user.id,
      refresh_token_hash: hashedNew,
      ip_address: matchedSession.ip_address,
      device_info: matchedSession.device_info,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return; // Token invalid — treat as already logged out
  }

  const sessions = await prisma.userSessions.findMany({
    where: { user_id: payload.id },
  });

  for (const session of sessions) {
    const match = await comparePassword(refreshToken, session.refresh_token_hash);
    if (match) {
      await prisma.userSessions.delete({ where: { id: session.id } });
      break;
    }
  }
};
