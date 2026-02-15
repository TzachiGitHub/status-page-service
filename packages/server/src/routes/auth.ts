import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { tokenBlacklist } from '../lib/tokenBlacklist.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

const registerSchema = z.object({
  orgName: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

function signToken(payload: { userId: string; orgId: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
}

router.post('/register', registerLimiter, validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgName, name, email, password } = req.body;

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const hashedPassword = await bcrypt.hash(password, 10);

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: { email, password: hashedPassword, name, role: 'OWNER' },
        },
      },
      include: { members: true },
    });

    const member = org.members[0];
    const token = signToken({ userId: member.id, orgId: org.id, role: member.role });

    res.status(201).json({
      token,
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: org.id, name: org.name, slug: org.slug },
    });
  } catch (err) {
    console.error('Registration error:', err);
    const message = (err as any)?.code === 'P2002' ? 'Organization name already taken' : 'Registration failed';
    res.status(500).json({ error: message });
  }
});

router.post('/login', loginLimiter, validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const member = await prisma.member.findUnique({ where: { email }, include: { organization: true } });
    if (!member) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, member.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: member.id, orgId: member.orgId, role: member.role });

    res.json({
      token,
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: member.organization.id, name: member.organization.name, slug: member.organization.slug },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.user!.userId },
      include: { organization: true },
    });
    if (!member) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: { id: member.id, email: member.email, name: member.name, role: member.role },
      organization: { id: member.organization.id, name: member.organization.name, slug: member.organization.slug },
    });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/logout', authenticate, (req: Request, res: Response) => {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    tokenBlacklist.add(token);
  }
  res.json({ message: 'Logged out successfully' });
});

export default router;
