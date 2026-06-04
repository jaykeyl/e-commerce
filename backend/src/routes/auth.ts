import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Campos requeridos: email, password, firstName, lastName' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    // Obtener rol CUSTOMER (id=2)
    let role = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
    if (!role) role = await prisma.role.create({ data: { name: 'CUSTOMER' } });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, roleId: role.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: { select: { name: true } } }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role.name },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
