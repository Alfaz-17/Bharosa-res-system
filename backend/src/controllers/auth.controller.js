import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Validation failed.', 422,
        parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
    }

    const { email, password } = parsed.data;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'];

    const result = await authService.login({ email, password, ipAddress, deviceInfo });

    // Set HTTP-Only Cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: false, // true for production
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Provide only accessToken and user in JSON
    return sendSuccess(res, {
      accessToken: result.accessToken,
      user: result.user
    }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token missing.', 401);
    }

    const result = await authService.refresh(refreshToken);

    // Set new HTTP-Only Cookie for newly rotated refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(res, {
      accessToken: result.accessToken
    }, 'Tokens refreshed.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};
