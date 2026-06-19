import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, signAccessToken, verifyRefreshToken, TokenPayload } from '../lib/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    // Try refresh token
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const payload = verifyRefreshToken(refreshToken);
      const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
      res.cookie('accessToken', newAccessToken, cookieOptions(15 * 60 * 1000));
      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
  };
}
