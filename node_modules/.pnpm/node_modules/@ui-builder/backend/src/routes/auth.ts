import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { requireAuth, AuthRequest, cookieOptions } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const existing = await UserModel.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const user = new UserModel({ name, email, passwordHash: password });
  await user.save();

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  return res.status(201).json({
    accessToken,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  return res.json({
    accessToken,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await UserModel.findById(req.user!.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));

  return res.json({
    accessToken,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });
    res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
