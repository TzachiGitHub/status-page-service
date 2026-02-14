import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  orgName: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(payload: { userId: string; orgId: string; role: string }): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}

router.post('/register', validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ error: 'Registration failed', message: (err as Error).message });
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ error: 'Login failed', message: (err as Error).message });
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
    res.status(500).json({ error: 'Failed to fetch user', message: (err as Error).message });
  }
});

export default router;
