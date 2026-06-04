import { Router, Request, Response } from 'express';
import { getMongo } from '../db/mongodb';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongodb';

const router = Router();

// ─── ESQUEMAS BSON POR CATEGORÍA ─────────────────────────────────
// Cada producto tiene: _id, storeId, nombre, precio, stock, tags[], category + atributos específicos

// GET /api/products?category=&minPrice=&maxPrice=&storeId=&search=
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const { category, minPrice, maxPrice, storeId, search, inStock } = req.query;

    const filter: any = {};

    // Filtro por categoría
    if (category) filter.category = category;

    // Filtro por tienda
    if (storeId) filter.storeId = storeId as string;

    // Rango de precios con $gt/$lt
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Solo en stock
    if (inStock === 'true') filter.stock = { $gt: 0 };

    // Búsqueda en nombre o tags (arreglo)
    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
        { brand: { $regex: search as string, $options: 'i' } }
      ];
    }

    const products = await db.collection('products').find(filter).limit(50).toArray();
    return res.json({ count: products.length, products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getMongo();
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/products — solo ADMIN o STORE_MANAGER
router.post('/', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const { name, category, price, stock, storeId, tags, brand, variants, ...attrs } = req.body;

    if (!name || !category || price === undefined || !storeId) {
      return res.status(400).json({ error: 'name, category, price, storeId son requeridos' });
    }

    // Validar atributos específicos por categoría
    const categoryAttrs = buildCategoryAttrs(category, attrs);

    const doc = {
      name,
      category,
      price: Number(price),
      stock: Number(stock) || 0,
      storeId,
      tags: Array.isArray(tags) ? tags : [],
      brand: brand || null,
      variants: Array.isArray(variants) ? variants : [],
      ...categoryAttrs,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('products').insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireRole('ADMIN', 'STORE_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    const { _id, ...updates } = req.body;
    updates.updatedAt = new Date();

    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = getMongo();
    await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
    return res.json({ message: 'Producto eliminado' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Helpers de esquema dinámico por categoría ─────────────────
function buildCategoryAttrs(category: string, attrs: any) {
  switch (category) {
    case 'electronica':
      return {
        voltage: attrs.voltage || '110V/220V',
        wattage: attrs.wattage || null,
        connectivity: Array.isArray(attrs.connectivity) ? attrs.connectivity : [],
        warrantyMonths: attrs.warrantyMonths || 12,
      };
    case 'ropa':
      return {
        sizes: Array.isArray(attrs.sizes) ? attrs.sizes : ['S', 'M', 'L', 'XL'],
        material: attrs.material || null,
        gender: attrs.gender || 'unisex',
        colors: Array.isArray(attrs.colors) ? attrs.colors : [],
      };
    case 'muebles':
      return {
        dimensions: attrs.dimensions || { width: null, height: null, depth: null },
        material: attrs.material || null,
        assembly: attrs.assembly !== undefined ? attrs.assembly : true,
        weightKg: attrs.weightKg || null,
      };
    case 'adornos':
      return {
        material: attrs.material || null,
        style: attrs.style || null,
        dimensions: attrs.dimensions || null,
      };
    case 'cocina':
      return {
        material: attrs.material || null,
        capacity: attrs.capacity || null,
        dishwasherSafe: attrs.dishwasherSafe !== undefined ? attrs.dishwasherSafe : false,
        ovenSafe: attrs.ovenSafe !== undefined ? attrs.ovenSafe : false,
      };
    default:
      return {};
  }
}

export default router;
