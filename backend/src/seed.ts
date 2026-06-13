/**
 * SEED — Pobla PostgreSQL y MongoDB con datos de ejemplo
 * Ejecutar: npm run db:seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './db/prisma';
import { connectMongo } from './db/mongodb';
import bcrypt from 'bcryptjs';

function invoiceNumber(index: number) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${date}-DEMO-${String(index).padStart(3, '0')}`;
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function invoiceAmounts(total: number) {
  const subtotal = roundMoney(total / 1.13);
  const taxAmount = roundMoney(total - subtotal);

  return {
    subtotal,
    taxAmount,
    totalAmount: roundMoney(total),
  };
}

async function seed() {
  const db = await connectMongo();

  console.log('🌱 Seeding PostgreSQL...');

  console.log('🧹 Limpiando datos demo anteriores...');

  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});

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

  const insertedProducts = await db.collection('products').insertMany(products);

  const mongoProducts = products.map((product, index) => ({
    ...product,
    _id: insertedProducts.insertedIds[index].toString(),
  }));

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

  console.log('🌱 Seeding PostgreSQL (órdenes, pagos y facturas demo)...');

  const defaultAddress = await prisma.address.create({
    data: {
      userId: customer.id,
      street: 'Av. 6 de Agosto 123',
      city: 'La Paz',
      state: 'La Paz',
      country: 'Bolivia',
      postalCode: '0001',
      isDefault: true,
    }
  });

  const findMongoProduct = (name: string) => {
    const product = mongoProducts.find(p => p.name === name);

    if (!product) {
      throw new Error(`Producto no encontrado en seed: ${name}`);
    }

    return product;
  };

  const demoOrders = [
    {
      store: techStore,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'AUTHORIZED',
      orderStatus: 'DELIVERED',
      businessName: 'María García',
      nit: '1234567',
      items: [
        { product: findMongoProduct('Laptop Lenovo IdeaPad 15'), quantity: 1 },
        { product: findMongoProduct('Auriculares Sony WH-1000XM5'), quantity: 1 },
      ],
    },
    {
      store: homeStore,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      orderStatus: 'CONFIRMED',
      businessName: 'María García',
      nit: '1234567',
      items: [
        { product: findMongoProduct('Set Ollas Acero Inoxidable (5 piezas)'), quantity: 1 },
        { product: findMongoProduct('Maceta Cerámica Minimalista'), quantity: 2 },
      ],
    },
    {
      store: fashionStore,
      paymentMethod: 'DEBIT_CARD',
      paymentStatus: 'AUTHORIZED',
      orderStatus: 'DELIVERED',
      businessName: 'María García',
      nit: '1234567',
      items: [
        { product: findMongoProduct('Chaqueta Denim Clásica'), quantity: 2 },
        { product: findMongoProduct('Vestido Floral de Verano'), quantity: 1 },
      ],
    },
  ];

  await db.collection('order_audit').deleteMany({ userId: customer.id });

  for (let index = 0; index < demoOrders.length; index++) {
    const demo = demoOrders[index];

    const totalAmount = roundMoney(
      demo.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    );

    const amounts = invoiceAmounts(totalAmount);

    const order = await prisma.order.create({
      data: {
        user: {
          connect: { id: customer.id },
        },
        store: {
          connect: { id: demo.store.id },
        },
        address: {
          connect: { id: defaultAddress.id },
        },
        status: demo.orderStatus as any,
        totalAmount,
        items: {
          create: demo.items.map(item => ({
            store: {
              connect: { id: demo.store.id },
            },
            mongoProductId: item.product._id,
            productName: item.product.name,
            productSku: item.product._id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: roundMoney(item.product.price * item.quantity),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        order: {
          connect: { id: order.id },
        },
        user: {
          connect: { id: customer.id },
        },
        method: demo.paymentMethod as any,
        status: demo.paymentStatus as any,
        amount: totalAmount,
        cardLastFour: demo.paymentMethod === 'CASH_ON_DELIVERY' ? null : '4242',
        cardTokenEncrypted: demo.paymentMethod === 'CASH_ON_DELIVERY'
          ? null
          : `demo-token-${index + 1}`,
        transactionRef: `TX-DEMO-${Date.now()}-${index + 1}`,
        processedAt: demo.paymentMethod === 'CASH_ON_DELIVERY' ? null : new Date(),
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        order: {
          connect: { id: order.id },
        },
        invoiceNumber: invoiceNumber(index + 1),
        nit: demo.nit,
        businessName: demo.businessName,
        subtotal: amounts.subtotal,
        taxAmount: amounts.taxAmount,
        totalAmount: amounts.totalAmount,
        currency: 'USD',
        status: 'ISSUED' as any,
        issuedAt: new Date(),
      },
    });

    await db.collection('order_audit').insertOne({
      orderId: order.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      paymentId: payment.id,
      userId: customer.id,
      storeSlug: demo.store.slug,
      totalAmount,
      source: 'seed-demo',
      integration: {
        postgres: ['orders', 'order_items', 'payments', 'invoices'],
        mongodb: ['products', 'order_audit', 'user_preferences'],
      },
      items: demo.items.map(item => ({
        mongoProductId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        category: item.product.category,
      })),
      createdAt: new Date(),
    });

    for (const item of demo.items) {
      await db.collection('products').updateOne(
        { _id: insertedProducts.insertedIds[products.findIndex(p => p.name === item.product.name)] },
        { $inc: { stock: -item.quantity } }
      );
    }
  }

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
