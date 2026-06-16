import { Router, Response } from 'express';
import { getMongo } from '../db/mongodb';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongodb';

const router = Router();

// El carrito vive en MongoDB, ligado al userId (UUID de PostgreSQL)

// GET /api/cart — obtener carrito del usuario autenticado
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const cart = await db.collection('carts').findOne({ userId: req.user!.userId });
    if (!cart) return res.json({ userId: req.user!.userId, items: [], total: 0 });

    // Enriquecer con datos actuales de productos
    const enriched = await Promise.all(cart.items.map(async (item: any) => {
      const product = await db.collection('products').findOne(
        { _id: new ObjectId(item.productId) },
        { projection: { name: 1, price: 1, stock: 1, category: 1 } }
      );
      return { ...item, product };
    }));

    const total = enriched.reduce((sum: number, i: any) => sum + (i.product?.price || 0) * i.quantity, 0);
    return res.json({ userId: cart.userId, items: enriched, total });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const { productId, quantity = 1 } = req.body;

    // Verificar que el producto existe y tiene stock
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });

    const userId = req.user!.userId;
    const cart = await db.collection('carts').findOne({ userId });

    if (!cart) {
      await db.collection('carts').insertOne({
        userId,
        items: [{ productId, quantity, addedAt: new Date() }],
        updatedAt: new Date()
      });
    } else {
      const existingIdx = cart.items.findIndex((i: any) => i.productId === productId);
      if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += quantity;
        await db.collection('carts').updateOne({ userId }, { $set: { items: cart.items, updatedAt: new Date() } });
      } else {
        await db.collection('carts').updateOne(
          { userId },
          { $push: { items: { productId, quantity, addedAt: new Date() } } as any, $set: { updatedAt: new Date() } }
        );
      }
    }

    return res.json({ message: 'Producto agregado al carrito' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// PATCH /api/cart/item/:productId — actualizar cantidad exacta
router.patch('/item/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const userId = req.user!.userId;
    const productId = String(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }

    if (quantity <= 0) {
      await db.collection('carts').updateOne(
        { userId },
        { $pull: { items: { productId } } as any, $set: { updatedAt: new Date() } }
      );
      return res.json({ message: 'Item eliminado del carrito' });
    }

    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });

    const cart = await db.collection('carts').findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const exists = cart.items.some((i: any) => i.productId === productId);
    if (!exists) return res.status(404).json({ error: 'Item no encontrado en el carrito' });

    await db.collection('carts').updateOne(
      { userId, 'items.productId': productId },
      {
        $set: {
          'items.$.quantity': quantity,
          updatedAt: new Date()
        }
      }
    );

    return res.json({ message: 'Cantidad actualizada' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/item/:productId
router.delete('/item/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    await db.collection('carts').updateOne(
      { userId: req.user!.userId },
      { $pull: { items: { productId: req.params.productId } } as any }
    );
    return res.json({ message: 'Item eliminado del carrito' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart — vaciar carrito
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    await db.collection('carts').deleteOne({ userId: req.user!.userId });
    return res.json({ message: 'Carrito vaciado' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
