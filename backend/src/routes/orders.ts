import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { getMongo } from '../db/mongodb';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongodb';

const router = Router();

// POST /api/orders — crear orden con transacción ACID
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const { storeId, addressId, paymentMethod, cardLastFour } = req.body;
    const userId = req.user!.userId;

    // 1. Obtener carrito de MongoDB
    const cart = await db.collection('carts').findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // 2. Verificar stock y construir items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
      if (!product) return res.status(400).json({ error: `Producto ${item.productId} no encontrado` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para: ${product.name}` });
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        storeId: Number(storeId),
        mongoProductId: item.productId,
        productName: product.name,
        productSku: product._id.toString(),
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    // 3. Transacción ACID en PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // Crear orden
      const order = await tx.order.create({
        data: {
          userId,
          storeId: Number(storeId),
          addressId: Number(addressId),
          totalAmount,
          currency: 'USD',
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Crear pago pendiente
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          userId,
          method: paymentMethod || 'CREDIT_CARD',
          amount: totalAmount,
          currency: 'USD',
          cardLastFour: cardLastFour || null,
          status: 'PENDING',
        },
      });

      return { order, payment };
    });

    // 4. Descontar stock en MongoDB (fuera de la transacción Postgres, pero después de confirmar)
    for (const item of cart.items) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: -item.quantity } }
      );
    }

    // 5. Vaciar carrito
    await db.collection('carts').deleteOne({ userId });

    return res.status(201).json({
      message: 'Orden creada exitosamente',
      orderId: result.order.id,
      totalAmount,
      paymentId: result.payment.id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — historial del usuario
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: true, payment: true, store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { items: true, payment: true, address: true, store: true },
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — solo ADMIN
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
