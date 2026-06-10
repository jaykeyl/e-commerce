import { Router, Request, Response } from 'express';
import { getMongo } from '../db/mongodb';
import { prisma } from '../db/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/products/expensive?minPrice=100&maxPrice=500&category=electronica
// Reporte comparativo con $gt, $lt, $and, $or
router.get('/products/expensive', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (_req: Request, res: Response) => {
  const req = _req as AuthRequest;
  try {
    const db = getMongo();
    const { minPrice = 0, maxPrice = 999999, category } = req.query;

    const filter: any = {
      $and: [
        { price: { $gt: Number(minPrice) } },
        { price: { $lt: Number(maxPrice) } },
        { stock: { $gt: 0 } },
      ]
    };
    if (category) filter.$and.push({ category });

    const products = await db.collection('products').find(filter).sort({ price: -1 }).toArray();
    return res.json({ count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/by-tags?tags=oferta,nuevo
// Manejo de arreglos con $in
router.get('/products/by-tags', authenticate, async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const tags = (req.query.tags as string)?.split(',').filter(Boolean) || [];
    const brands = (req.query.brands as string)?.split(',').filter(Boolean) || [];

    const filter: any = {};

    if (tags.length > 0 && brands.length > 0) {
      // $or entre tags y brands
      filter.$or = [
        { tags: { $in: tags } },
        { brand: { $in: brands } }
      ];
    } else if (tags.length > 0) {
      filter.tags = { $in: tags };
    } else if (brands.length > 0) {
      filter.brand = { $in: brands };
    }

    const products = await db.collection('products').find(filter).toArray();
    return res.json({ count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/low-stock?threshold=5
router.get('/products/low-stock', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const threshold = Number(req.query.threshold) || 5;
    const products = await db.collection('products')
      .find({ stock: { $lt: threshold } })
      .sort({ stock: 1 })
      .toArray();
    return res.json({ count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/sales — ventas por tienda (PostgreSQL)
router.get('/sales', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const summary = await prisma.order.groupBy({
      by: ['storeId', 'status'],
      _sum: { totalAmount: true },
      _count: { id: true },
    });
    const stores = await prisma.store.findMany();
    const storeMap = Object.fromEntries(stores.map(s => [s.id, s.name]));

    const result = summary.map(s => ({
      storeId: s.storeId,
      storeName: storeMap[s.storeId] || 'Unknown',
      status: s.status,
      totalRevenue: s._sum.totalAmount,
      orderCount: s._count.id,
    }));

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/customers/:userId/profile
// Integración: datos de PostgreSQL + preferencias/carrito de MongoDB
router.get('/customers/:userId/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Solo admin o el mismo usuario
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== userId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // PostgreSQL: datos transaccionales
    const [user, orders] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true, role: { select: { name: true } } }
      }),
      prisma.order.findMany({
        where: { userId },
        select: { id: true, totalAmount: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // MongoDB: carrito y preferencias (usando UUID como link)
    const db = getMongo();
    const [cart, preferences] = await Promise.all([
      db.collection('carts').findOne({ userId }),
      db.collection('user_preferences').findOne({ userId })
    ]);

    return res.json({
      user,                              // PostgreSQL
      recentOrders: orders,             // PostgreSQL
      cart: cart || { items: [] },      // MongoDB
      preferences: preferences || {},   // MongoDB
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
