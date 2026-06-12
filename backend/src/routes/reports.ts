import { Router, Request, Response } from 'express';
import { getMongo } from '../db/mongodb';
import { prisma } from '../db/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/products/expensive?minPrice=100&maxPrice=500&category=electronica
// Reporte comparativo con $gt, $lt, $and
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
      ],
    };

    if (category) {
      filter.$and.push({ category: String(category) });
    }

    const products = await db.collection('products')
      .find(filter)
      .sort({ price: -1 })
      .toArray();

    return res.json({
      report: 'Productos por rango de precio',
      database: 'MongoDB',
      operators: ['$gt', '$lt', '$and'],
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/by-tags?tags=oferta,nuevo&brands=Lenovo,Samsung
// Manejo de arreglos con $in y $or
router.get('/products/by-tags', authenticate, async (req: Request, res: Response) => {
  try {
    const db = getMongo();

    const tags = (req.query.tags as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const brands = (req.query.brands as string)?.split(',').map(b => b.trim()).filter(Boolean) || [];

    const filter: any = {};

    if (tags.length > 0 && brands.length > 0) {
      filter.$or = [
        { tags: { $in: tags } },
        { brand: { $in: brands } },
      ];
    } else if (tags.length > 0) {
      filter.tags = { $in: tags };
    } else if (brands.length > 0) {
      filter.brand = { $in: brands };
    }

    const products = await db.collection('products')
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return res.json({
      report: 'Productos por etiquetas o marcas',
      database: 'MongoDB',
      operators: tags.length > 0 && brands.length > 0 ? ['$or', '$in'] : ['$in'],
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/low-stock?threshold=5
// Stock bajo con $lt
router.get('/products/low-stock', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const threshold = Number(req.query.threshold) || 5;

    const products = await db.collection('products')
      .find({ stock: { $lt: threshold } })
      .sort({ stock: 1 })
      .toArray();

    return res.json({
      report: 'Productos con bajo stock',
      database: 'MongoDB',
      operators: ['$lt'],
      threshold,
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/dynamic-attributes?category=electronica
// Demuestra atributos dinámicos en BSON según categoría
router.get('/products/dynamic-attributes', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const { category } = req.query;

    const match: any = {};
    if (category) {
      match.category = String(category);
    }

    const products = await db.collection('products')
      .find(match)
      .project({
        name: 1,
        category: 1,
        brand: 1,
        price: 1,
        stock: 1,
        tags: 1,
        variants: 1,
        voltage: 1,
        warrantyMonths: 1,
        connectivity: 1,
        sizes: 1,
        colors: 1,
        material: 1,
        dimensions: 1,
        capacity: 1,
        dishwasherSafe: 1,
        ovenSafe: 1,
      })
      .sort({ category: 1, name: 1 })
      .toArray();

    const summary = products.map((product: any) => {
      const dynamicKeys = Object.keys(product).filter(key =>
        !['_id', 'name', 'category', 'brand', 'price', 'stock', 'createdAt', 'updatedAt'].includes(key)
      );

      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        dynamicFields: dynamicKeys,
        dynamicFieldCount: dynamicKeys.length,
      };
    });

    return res.json({
      report: 'Atributos dinámicos por categoría',
      database: 'MongoDB BSON',
      objective: 'Demostrar que cada categoría puede almacenar campos diferentes sin cambiar el esquema relacional',
      count: summary.length,
      products: summary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/variants?color=gris&size=M
// Consulta sobre arreglos de variantes
router.get('/products/variants', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const { color, size } = req.query;

    const orConditions: any[] = [];

    if (color) {
      orConditions.push({ 'variants.color': String(color) });
      orConditions.push({ colors: String(color) });
    }

    if (size) {
      orConditions.push({ 'variants.size': String(size) });
      orConditions.push({ sizes: String(size) });
    }

    const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const products = await db.collection('products')
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return res.json({
      report: 'Consulta por variantes',
      database: 'MongoDB',
      operators: ['$or', 'dot notation sobre arreglos'],
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/category-summary
// Agregación por categoría usando aggregation pipeline
router.get('/products/category-summary', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (_req: Request, res: Response) => {
  try {
    const db = getMongo();

    const summary = await db.collection('products').aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
          brands: { $addToSet: '$brand' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalProducts: 1,
          totalStock: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          maxPrice: 1,
          minPrice: 1,
          brands: 1,
          brandCount: { $size: '$brands' },
        },
      },
      { $sort: { totalProducts: -1 } },
    ]).toArray();

    return res.json({
      report: 'Resumen por categoría',
      database: 'MongoDB',
      operators: ['$group', '$sum', '$avg', '$max', '$min', '$addToSet', '$project'],
      count: summary.length,
      products: summary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/products/premium-or-low-stock?minPrice=500&threshold=10
// Uso de $or: productos premium o productos críticos de inventario
router.get('/products/premium-or-low-stock', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const minPrice = Number(req.query.minPrice) || 500;
    const threshold = Number(req.query.threshold) || 10;

    const products = await db.collection('products')
      .find({
        $or: [
          { price: { $gt: minPrice } },
          { stock: { $lt: threshold } },
        ],
      })
      .sort({ price: -1, stock: 1 })
      .toArray();

    return res.json({
      report: 'Productos premium o con stock crítico',
      database: 'MongoDB',
      operators: ['$or', '$gt', '$lt'],
      count: products.length,
      products,
    });
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

    return res.json({
      report: 'Ventas por tienda',
      database: 'PostgreSQL',
      objective: 'Agrupación relacional de órdenes y montos transaccionales',
      count: result.length,
      products: result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/invoices/summary — resumen de facturación PostgreSQL
router.get('/invoices/summary', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        order: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            store: true,
            payment: true,
          },
        },
      },
    });

    const result = invoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      businessName: invoice.businessName,
      nit: invoice.nit,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      customer: `${invoice.order.user.firstName} ${invoice.order.user.lastName}`,
      store: invoice.order.store.name,
      paymentStatus: invoice.order.payment?.status || 'SIN_PAGO',
    }));

    return res.json({
      report: 'Resumen de facturación',
      database: 'PostgreSQL',
      objective: 'Evidenciar facturación formal asociada a órdenes y pagos',
      count: result.length,
      products: result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/customers/:userId/profile
// Integración: datos de PostgreSQL + preferencias/carrito de MongoDB
router.get('/customers/:userId/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user!.role !== 'ADMIN' && req.user!.userId !== userId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [user, orders] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          role: { select: { name: true } },
        },
      }),
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const db = getMongo();

    const [cart, preferences, audit] = await Promise.all([
      db.collection('carts').findOne({ userId }),
      db.collection('user_preferences').findOne({ userId }),
      db.collection('order_audit').find({ userId }).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    return res.json({
      report: 'Perfil integrado del cliente',
      linkKey: 'userId',
      relationalData: {
        source: 'PostgreSQL',
        user,
        recentOrders: orders,
      },
      documentData: {
        source: 'MongoDB',
        cart: cart || { items: [] },
        preferences: preferences || {},
        recentCheckoutAudit: audit,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;