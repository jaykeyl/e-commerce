/**
 * SEED — Pobla PostgreSQL y MongoDB con datos de ejemplo
 * Ejecutar: npm run db:seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './db/prisma';
import { connectMongo } from './db/mongodb';
import bcrypt from 'bcryptjs';

async function seed() {
  const db = await connectMongo();

  console.log('🌱 Seeding PostgreSQL...');

  // Roles
  const adminRole = await prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } });
  const customerRole = await prisma.role.upsert({ where: { name: 'CUSTOMER' }, update: {}, create: { name: 'CUSTOMER' } });
  await prisma.role.upsert({ where: { name: 'STORE_MANAGER' }, update: {}, create: { name: 'STORE_MANAGER' } });

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'Sistema',
      roleId: adminRole.id,
    }
  });

  // Customer user
  const custHash = await bcrypt.hash('pass123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      passwordHash: custHash,
      firstName: 'María',
      lastName: 'García',
      phone: '+591 70000001',
      roleId: customerRole.id,
    }
  });

  // Stores
  const techStore = await prisma.store.upsert({
    where: { slug: 'tech-zone' },
    update: {},
    create: { name: 'Tech Zone', slug: 'tech-zone', description: 'Electrónica y tecnología' }
  });
  const fashionStore = await prisma.store.upsert({
    where: { slug: 'moda-urbana' },
    update: {},
    create: { name: 'Moda Urbana', slug: 'moda-urbana', description: 'Ropa y accesorios' }
  });
  const homeStore = await prisma.store.upsert({
    where: { slug: 'casa-bella' },
    update: {},
    create: { name: 'Casa Bella', slug: 'casa-bella', description: 'Muebles, adornos y cocina' }
  });

  // Address for customer
  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      street: 'Av. 6 de Agosto 123',
      city: 'La Paz',
      state: 'La Paz',
      country: 'Bolivia',
      postalCode: '0001',
      isDefault: true,
    }
  }).catch(() => null);

  console.log('🌱 Seeding MongoDB (catálogo de productos)...');
  await db.collection('products').deleteMany({});

  const products = [
    // ELECTRÓNICA
    {
      name: 'Laptop Lenovo IdeaPad 15',
      category: 'electronica',
      price: 750,
      stock: 15,
      storeId: techStore.slug,
      tags: ['laptop', 'oferta', 'nuevo'],
      brand: 'Lenovo',
      variants: [{ color: 'gris' }, { color: 'negro' }],
      voltage: '110V/220V',
      wattage: 65,
      connectivity: ['WiFi 6', 'Bluetooth 5.0', 'USB-C'],
      warrantyMonths: 12,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Smartphone Samsung Galaxy A54',
      category: 'electronica',
      price: 320,
      stock: 30,
      storeId: techStore.slug,
      tags: ['smartphone', 'android', 'oferta'],
      brand: 'Samsung',
      variants: [{ color: 'negro' }, { color: 'blanco' }, { color: 'violeta' }],
      voltage: '5V (USB-C)',
      wattage: 25,
      connectivity: ['5G', 'WiFi', 'Bluetooth', 'NFC'],
      warrantyMonths: 12,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Auriculares Sony WH-1000XM5',
      category: 'electronica',
      price: 180,
      stock: 20,
      storeId: techStore.slug,
      tags: ['audio', 'inalambrico', 'premium'],
      brand: 'Sony',
      variants: [{ color: 'negro' }, { color: 'plateado' }],
      voltage: '5V (USB-C)',
      wattage: 3,
      connectivity: ['Bluetooth 5.2', 'NFC', 'USB-C'],
      warrantyMonths: 12,
      createdAt: new Date(), updatedAt: new Date(),
    },
    // ROPA
    {
      name: 'Chaqueta Denim Clásica',
      category: 'ropa',
      price: 45,
      stock: 50,
      storeId: fashionStore.slug,
      tags: ['casual', 'denim', 'unisex'],
      brand: 'UrbanWear',
      variants: [{ size: 'S', color: 'azul' }, { size: 'M', color: 'azul' }, { size: 'L', color: 'negro' }],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      material: 'Denim 100% algodón',
      gender: 'unisex',
      colors: ['azul clásico', 'negro', 'gris claro'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Vestido Floral de Verano',
      category: 'ropa',
      price: 35,
      stock: 40,
      storeId: fashionStore.slug,
      tags: ['verano', 'floral', 'femenino'],
      brand: 'Floresta',
      variants: [{ size: 'S', color: 'rosado' }, { size: 'M', color: 'amarillo' }],
      sizes: ['XS', 'S', 'M', 'L'],
      material: 'Polyester suave',
      gender: 'femenino',
      colors: ['rosado', 'amarillo', 'celeste'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    // MUEBLES
    {
      name: 'Sofá 3 Plazas Escandinavo',
      category: 'muebles',
      price: 450,
      stock: 5,
      storeId: homeStore.slug,
      tags: ['sala', 'escandinavo', 'comodo'],
      brand: 'NórdikHome',
      variants: [{ color: 'beige' }, { color: 'gris' }],
      dimensions: { width: 210, height: 85, depth: 90 },
      material: 'Madera maciza + tela',
      assembly: true,
      weightKg: 45,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Mesa de Comedor Roble 6 Sillas',
      category: 'muebles',
      price: 680,
      stock: 3,
      storeId: homeStore.slug,
      tags: ['comedor', 'madera', 'premium'],
      brand: 'NórdikHome',
      variants: [{ finish: 'natural' }, { finish: 'oscuro' }],
      dimensions: { width: 180, height: 76, depth: 90 },
      material: 'Roble natural',
      assembly: true,
      weightKg: 60,
      createdAt: new Date(), updatedAt: new Date(),
    },
    // ADORNOS
    {
      name: 'Maceta Cerámica Minimalista',
      category: 'adornos',
      price: 18,
      stock: 80,
      storeId: homeStore.slug,
      tags: ['decoracion', 'planta', 'ceramica'],
      brand: 'ArteCasa',
      variants: [{ size: 'pequeño', color: 'blanco' }, { size: 'grande', color: 'terracota' }],
      material: 'Cerámica vidriada',
      style: 'minimalista',
      dimensions: { diameter: 15, height: 18 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Cuadro Abstracto Moderno 60x80',
      category: 'adornos',
      price: 55,
      stock: 15,
      storeId: homeStore.slug,
      tags: ['arte', 'pared', 'moderno'],
      brand: 'GaleriaUno',
      variants: [{ theme: 'azul-dorado' }, { theme: 'rojo-negro' }],
      material: 'Canvas sobre bastidor',
      style: 'abstracto',
      dimensions: { width: 60, height: 80 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    // COCINA
    {
      name: 'Set Ollas Acero Inoxidable (5 piezas)',
      category: 'cocina',
      price: 95,
      stock: 25,
      storeId: homeStore.slug,
      tags: ['cocina', 'acero', 'set', 'oferta'],
      brand: 'ChefPro',
      variants: [{ pieces: 5 }, { pieces: 8 }],
      material: 'Acero inoxidable 18/10',
      capacity: '1L - 5L',
      dishwasherSafe: true,
      ovenSafe: true,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Licuadora de Vaso 2L',
      category: 'cocina',
      price: 55,
      stock: 35,
      storeId: homeStore.slug,
      tags: ['electrodomestico', 'cocina', 'jugos'],
      brand: 'BlendMaster',
      variants: [{ color: 'negro' }, { color: 'plateado' }],
      material: 'Plástico BPA Free + acero',
      capacity: '2L',
      dishwasherSafe: true,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    },
  ];

  await db.collection('products').insertMany(products);

  // Preferencias del cliente en MongoDB (link por UUID)
  await db.collection('user_preferences').deleteMany({ userId: customer.id });
  await db.collection('user_preferences').insertOne({
    userId: customer.id,  // UUID de PostgreSQL — este es el LINK entre BDs
    favoriteCategories: ['ropa', 'cocina'],
    favoriteStores: [fashionStore.slug, homeStore.slug],
    notifications: { email: true, sms: false },
    language: 'es',
    updatedAt: new Date(),
  });

  console.log('✅ Seed completado!');
  console.log(`   Admin: admin@ecommerce.com / admin123`);
  console.log(`   Cliente: cliente@ejemplo.com / pass123`);
  console.log(`   Productos: ${products.length} en MongoDB`);
  console.log(`   Tiendas: tech-zone, moda-urbana, casa-bella`);

  await prisma.$disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
