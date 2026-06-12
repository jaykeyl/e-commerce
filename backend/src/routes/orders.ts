import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { getMongo } from '../db/mongodb';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongodb';
import { getCardLastFour, tokenizeCard } from '../services/crypto.service';
import { buildInvoiceAmounts, generateInvoiceNumber } from '../services/invoice.service';

const router = Router();

// GET /api/orders/stores — tiendas disponibles para checkout
router.get('/stores', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    return res.json(stores);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — crear orden con transacción ACID
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();

    const {
      storeId,
      addressId,
      address,
      city,
      notes,
      paymentMethod,
      cardNumber,
      cardLastFour,
      nit,
      businessName,
    } = req.body;

    const userId = req.user!.userId;

    if (!storeId) {
      return res.status(400).json({ error: 'Debe seleccionar una tienda' });
    }

    // 1. Validar tienda en PostgreSQL
    const store = await prisma.store.findUnique({
      where: { id: Number(storeId) },
    });

    if (!store) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 2. Resolver dirección
    // Bloque 1: usamos addressId si viene; si no, usamos una dirección existente del usuario.
    let finalAddressId = addressId ? Number(addressId) : null;

    if (!finalAddressId) {
      const existingAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { id: 'asc' },
      });

      if (!existingAddress) {
        return res.status(400).json({
          error: 'No se encontró una dirección registrada para este usuario',
        });
      }

      finalAddressId = existingAddress.id;
    }

    // 3. Obtener carrito de MongoDB
    const cart = await db.collection('carts').findOne({ userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // 4. Verificar stock y construir items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await db.collection('products').findOne({
        _id: new ObjectId(item.productId),
      });

      if (!product) {
        return res.status(400).json({
          error: `Producto ${item.productId} no encontrado`,
        });
      }

      if (Number(product.stock) < Number(item.quantity)) {
        return res.status(400).json({
          error: `Stock insuficiente para: ${product.name}`,
        });
      }

      const subtotal = Number(product.price) * Number(item.quantity);
      totalAmount += subtotal;

      orderItems.push({
        storeId: Number(storeId),
        mongoProductId: item.productId,
        productName: product.name,
        productSku: product._id.toString(),
        quantity: Number(item.quantity),
        unitPrice: Number(product.price),
        subtotal,
      });
    }

    const normalizedPaymentMethod = paymentMethod || 'CASH_ON_DELIVERY';
    const finalCardLastFour = cardLastFour || getCardLastFour(cardNumber) || null;
    const encryptedCardToken =
      normalizedPaymentMethod === 'CREDIT_CARD' || normalizedPaymentMethod === 'DEBIT_CARD'
        ? tokenizeCard(cardNumber)
        : null;

    const invoiceAmounts = buildInvoiceAmounts(totalAmount);
    const finalBusinessName =
      businessName || `${user.firstName} ${user.lastName}` || 'Consumidor Final';
    const finalNit = nit || '0';

    if (!finalAddressId) {
      return res.status(400).json({
        error: 'No se pudo resolver la dirección de entrega',
      });
    }

    // 5. Transacción ACID en PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          storeId: Number(storeId),
          addressId: finalAddressId,
          totalAmount,
          currency: 'USD',
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          payment: true,
          store: true,
          address: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          userId,
          method: normalizedPaymentMethod,
          amount: totalAmount,
          currency: 'USD',
          cardLastFour: finalCardLastFour,
          cardTokenEncrypted: encryptedCardToken,
          transactionRef: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          status:
            normalizedPaymentMethod === 'CASH_ON_DELIVERY'
              ? 'PENDING'
              : 'AUTHORIZED',
          processedAt:
            normalizedPaymentMethod === 'CASH_ON_DELIVERY'
              ? null
              : new Date(),
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: generateInvoiceNumber(),
          nit: finalNit,
          businessName: finalBusinessName,
          subtotal: invoiceAmounts.subtotal,
          taxAmount: invoiceAmounts.taxAmount,
          totalAmount: invoiceAmounts.totalAmount,
          currency: 'USD',
          status: 'ISSUED',
        },
      });

      return { order, payment, invoice };
    });

    // 6. Descontar stock en MongoDB con validación atómica simple
    for (const item of cart.items) {
      await db.collection('products').updateOne(
        {
          _id: new ObjectId(item.productId),
          stock: { $gte: Number(item.quantity) },
        },
        {
          $inc: { stock: -Number(item.quantity) },
        }
      );
    }

    // 7. Auditoría de integración en MongoDB
    await db.collection('order_audit').insertOne({
      userId,
      orderId: result.order.id,
      storeId: Number(storeId),
      addressText: address || null,
      city: city || null,
      notes: notes || null,
      totalAmount,
      paymentId: result.payment.id,
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
      paymentMethod: normalizedPaymentMethod,
      createdAt: new Date(),
      source: 'checkout',
      integration: {
        relationalDB: 'PostgreSQL',
        documentDB: 'MongoDB',
        linkKey: 'userId / mongoProductId',
      },
    });

    // 8. Vaciar carrito
    await db.collection('carts').deleteOne({ userId });

    return res.status(201).json({
      message: 'Orden creada exitosamente',
      id: result.order.id,
      orderId: result.order.id,
      totalAmount,
      paymentId: result.payment.id,
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
      status: result.order.status,
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
      include: {
        items: true,
        payment: true,
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/invoice — factura de una orden
router.get('/:id/invoice', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        orderId: req.params.id,
        order: {
          userId: req.user!.userId,
        },
      },
      include: {
        order: {
          include: {
            items: true,
            payment: true,
            store: true,
            address: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    return res.json(invoice);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        items: true,
        payment: true,
        address: true,
        store: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

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