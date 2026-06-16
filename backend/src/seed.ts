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
      imageUrl: '/assets/products/ideapad.jpg',
      storeId: techStore.slug,
      tags: ['laptop', 'nuevo'],
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
      imageUrl: '/assets/products/samsungA54.jpg',
      storeId: techStore.slug,
      tags: ['smartphone', 'android'],
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
      imageUrl: '/assets/products/sonyHeadphones.jpg',
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
      imageUrl: '/assets/products/denim.jpg',
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
      originalPrice: 70,
      discountPercent: 50,
      stock: 40,
      imageUrl: '/assets/products/vestido-floral.png',
      storeId: fashionStore.slug,
      tags: ['verano', 'floral', 'femenino', 'oferta'],
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
      imageUrl: '/assets/products/sofa.jpg',
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
      originalPrice: 1360,
      discountPercent: 50,
      stock: 3,
      imageUrl: '/assets/products/comedor.jpg',
      storeId: homeStore.slug,
      tags: ['comedor', 'madera', 'premium', 'oferta'],
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
      imageUrl: '/assets/products/mceta.jpg',
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
      imageUrl: '/assets/products/cuadro.jpg',
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
      originalPrice: 190,
      discountPercent: 50,
      stock: 25,
      imageUrl: '/assets/products/ollas.jpg',
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
      imageUrl: '/assets/products/licuadora.jpg',
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
    // ELECTRÓNICA EXTRA
    {
      name: 'Monitor LG UltraWide 29',
      category: 'electronica',
      price: 260,
      originalPrice: 520,
      discountPercent: 50,
      stock: 18,
      imageUrl: '/assets/products/monitor-lg.webp',
      storeId: techStore.slug,
      tags: ['monitor', 'oficina', 'premium', 'oferta'],
      brand: 'LG',
      variants: [{ size: '29 pulgadas' }, { refreshRate: '75Hz' }],
      voltage: '110V/220V',
      wattage: 45,
      connectivity: ['HDMI', 'DisplayPort'],
      warrantyMonths: 12,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Tablet Samsung Galaxy Tab A9',
      category: 'electronica',
      price: 210,
      stock: 22,
      imageUrl: '/assets/products/tablet-samsung.avif',
      storeId: techStore.slug,
      tags: ['tablet', 'android', 'portatil'],
      brand: 'Samsung',
      variants: [{ storage: '64GB' }, { storage: '128GB' }],
      voltage: '5V (USB-C)',
      wattage: 15,
      connectivity: ['WiFi', 'Bluetooth', 'USB-C'],
      warrantyMonths: 12,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Teclado Mecánico RGB',
      category: 'electronica',
      price: 85,
      stock: 28,
      imageUrl: '/assets/products/teclado-rgb.jpg',
      storeId: techStore.slug,
      tags: ['teclado', 'gaming', 'rgb'],
      brand: 'KeyMaster',
      variants: [{ switches: 'blue' }, { switches: 'red' }],
      voltage: '5V (USB)',
      wattage: 5,
      connectivity: ['USB-C'],
      warrantyMonths: 6,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Mouse Gamer Inalámbrico',
      category: 'electronica',
      price: 48,
      stock: 34,
      imageUrl: '/assets/products/mouse-gamer.jpg',
      storeId: techStore.slug,
      tags: ['mouse', 'gaming', 'inalambrico'],
      brand: 'ClickPro',
      variants: [{ color: 'negro' }, { color: 'blanco' }],
      voltage: '5V (USB-C)',
      wattage: 2,
      connectivity: ['Bluetooth', 'USB Receiver'],
      warrantyMonths: 6,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Parlante Bluetooth Portátil',
      category: 'electronica',
      price: 70,
      stock: 12,
      imageUrl: '/assets/products/parlante-bluetooth.webp',
      storeId: techStore.slug,
      tags: ['audio', 'bluetooth', 'portatil'],
      brand: 'SoundBeat',
      variants: [{ color: 'negro' }, { color: 'azul' }],
      voltage: '5V (USB-C)',
      wattage: 20,
      connectivity: ['Bluetooth 5.0', 'AUX'],
      warrantyMonths: 6,
      createdAt: new Date(), updatedAt: new Date(),
    },

    // ROPA EXTRA
    {
      name: 'Polera Básica Algodón',
      category: 'ropa',
      price: 18,
      stock: 60,
      imageUrl: '/assets/products/polera-basica.webp',
      storeId: fashionStore.slug,
      tags: ['basico', 'algodon', 'casual'],
      brand: 'UrbanWear',
      variants: [{ size: 'S', color: 'blanco' }, { size: 'M', color: 'negro' }, { size: 'L', color: 'gris' }],
      sizes: ['S', 'M', 'L', 'XL'],
      material: 'Algodón 100%',
      gender: 'unisex',
      colors: ['blanco', 'negro', 'gris'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Jean Mom Fit Azul',
      category: 'ropa',
      price: 42,
      stock: 32,
      imageUrl: '/assets/products/jean-mom-fit.jpg',
      storeId: fashionStore.slug,
      tags: ['jean', 'denim', 'casual'],
      brand: 'DenimLab',
      variants: [{ size: '36' }, { size: '38' }, { size: '40' }],
      sizes: ['36', '38', '40', '42'],
      material: 'Denim stretch',
      gender: 'femenino',
      colors: ['azul medio'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Camisa Oxford Blanca',
      category: 'ropa',
      price: 38,
      stock: 26,
      imageUrl: '/assets/products/camisa-oxford.png',
      storeId: fashionStore.slug,
      tags: ['camisa', 'formal', 'oficina'],
      brand: 'Moda Urbana',
      variants: [{ size: 'S' }, { size: 'M' }, { size: 'L' }],
      sizes: ['S', 'M', 'L', 'XL'],
      material: 'Algodón Oxford',
      gender: 'unisex',
      colors: ['blanco', 'celeste'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Hoodie Oversize Gris',
      category: 'ropa',
      price: 52,
      originalPrice: 104,
      discountPercent: 50,
      stock: 21,
      imageUrl: '/assets/products/hoodie-oversize.webp',
      storeId: fashionStore.slug,
      tags: ['hoodie', 'oversize', 'invierno', 'oferta'],
      brand: 'UrbanWear',
      variants: [{ size: 'M', color: 'gris' }, { size: 'L', color: 'negro' }],
      sizes: ['M', 'L', 'XL'],
      material: 'Algodón felpado',
      gender: 'unisex',
      colors: ['gris', 'negro'],
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Falda Plisada Beige',
      category: 'ropa',
      price: 33,
      stock: 19,
      imageUrl: '/assets/products/falda-plisada.jpg',
      storeId: fashionStore.slug,
      tags: ['falda', 'beige', 'casual'],
      brand: 'Floresta',
      variants: [{ size: 'S' }, { size: 'M' }],
      sizes: ['XS', 'S', 'M', 'L'],
      material: 'Polyester',
      gender: 'femenino',
      colors: ['beige', 'negro'],
      createdAt: new Date(), updatedAt: new Date(),
    },

    // MUEBLES EXTRA
    {
      name: 'Escritorio Minimalista Blanco',
      category: 'muebles',
      price: 220,
      stock: 9,
      imageUrl: '/assets/products/escritorio-minimalista.jpg',
      storeId: homeStore.slug,
      tags: ['oficina', 'minimalista', 'madera'],
      brand: 'Casa Bella',
      variants: [{ finish: 'blanco' }, { finish: 'natural' }],
      dimensions: { width: 120, height: 75, depth: 60 },
      material: 'MDF + metal',
      assembly: true,
      weightKg: 28,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Silla Ergonómica Oficina',
      category: 'muebles',
      price: 160,
      stock: 14,
      imageUrl: '/assets/products/silla-ergonomica.jpg',
      storeId: homeStore.slug,
      tags: ['oficina', 'ergonomica', 'comodidad'],
      brand: 'NórdikHome',
      variants: [{ color: 'negro' }, { color: 'gris' }],
      dimensions: { width: 62, height: 115, depth: 62 },
      material: 'Malla + metal',
      assembly: true,
      weightKg: 18,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Repisa Flotante Roble',
      category: 'muebles',
      price: 75,
      stock: 27,
      imageUrl: '/assets/products/repisa-roble.webp',
      storeId: homeStore.slug,
      tags: ['repisa', 'pared', 'madera'],
      brand: 'Casa Bella',
      variants: [{ width: 80 }, { width: 120 }],
      dimensions: { width: 80, height: 4, depth: 24 },
      material: 'Roble laminado',
      assembly: true,
      weightKg: 6,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Mesa Auxiliar Redonda',
      category: 'muebles',
      price: 95,
      stock: 6,
      imageUrl: '/assets/products/mesa-auxiliar.jpg',
      storeId: homeStore.slug,
      tags: ['mesa', 'sala', 'auxiliar'],
      brand: 'NórdikHome',
      variants: [{ finish: 'natural' }, { finish: 'negro' }],
      dimensions: { diameter: 55, height: 50 },
      material: 'Madera + metal',
      assembly: true,
      weightKg: 10,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Velador con Cajón',
      category: 'muebles',
      price: 130,
      stock: 11,
      imageUrl: '/assets/products/velador-cajon.webp',
      storeId: homeStore.slug,
      tags: ['dormitorio', 'velador', 'madera'],
      brand: 'Casa Bella',
      variants: [{ finish: 'nogal' }, { finish: 'blanco' }],
      dimensions: { width: 45, height: 55, depth: 40 },
      material: 'Madera industrializada',
      assembly: false,
      weightKg: 14,
      createdAt: new Date(), updatedAt: new Date(),
    },

    // ADORNOS EXTRA
    {
      name: 'Jarrón Decorativo Terracota',
      category: 'adornos',
      price: 28,
      stock: 42,
      imageUrl: '/assets/products/jarron-terracota.jpg',
      storeId: homeStore.slug,
      tags: ['jarron', 'decoracion', 'terracota'],
      brand: 'ArteCasa',
      variants: [{ size: 'mediano' }, { size: 'grande' }],
      material: 'Cerámica',
      style: 'boho',
      dimensions: { diameter: 18, height: 32 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Espejo Redondo Dorado',
      category: 'adornos',
      price: 65,
      originalPrice: 130,
      discountPercent: 50,
      stock: 16,
      imageUrl: '/assets/products/espejo-dorado.jpg',
      storeId: homeStore.slug,
      tags: ['espejo', 'pared', 'dorado', 'oferta'],
      brand: 'GaleriaUno',
      variants: [{ diameter: 60 }, { diameter: 80 }],
      material: 'Vidrio + metal',
      style: 'moderno',
      dimensions: { diameter: 60 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Lámpara de Mesa Cerámica',
      category: 'adornos',
      price: 48,
      stock: 23,
      imageUrl: '/assets/products/lampara-ceramica.jpg',
      storeId: homeStore.slug,
      tags: ['lampara', 'mesa', 'decoracion'],
      brand: 'ArteCasa',
      variants: [{ color: 'blanco' }, { color: 'beige' }],
      material: 'Cerámica + tela',
      style: 'minimalista',
      dimensions: { diameter: 22, height: 38 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Set Velas Aromáticas',
      category: 'adornos',
      price: 22,
      stock: 55,
      imageUrl: '/assets/products/velas-aromaticas.avif',
      storeId: homeStore.slug,
      tags: ['velas', 'aroma', 'hogar'],
      brand: 'ArteCasa',
      variants: [{ aroma: 'vainilla' }, { aroma: 'lavanda' }],
      material: 'Cera vegetal',
      style: 'relajante',
      dimensions: { height: 10 },
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Reloj de Pared Moderno',
      category: 'adornos',
      price: 39,
      stock: 29,
      imageUrl: '/assets/products/reloj-pared.jpg',
      storeId: homeStore.slug,
      tags: ['reloj', 'pared', 'moderno'],
      brand: 'GaleriaUno',
      variants: [{ color: 'negro' }, { color: 'dorado' }],
      material: 'Metal + madera',
      style: 'moderno',
      dimensions: { diameter: 40 },
      createdAt: new Date(), updatedAt: new Date(),
    },

    // COCINA EXTRA
    {
      name: 'Freidora de Aire 4L',
      category: 'cocina',
      price: 120,
      originalPrice: 240,
      discountPercent: 50,
      stock: 17,
      imageUrl: '/assets/products/freidora-aire.webp',
      storeId: homeStore.slug,
      tags: ['freidora', 'aire', 'cocina', 'oferta'],
      brand: 'ChefPro',
      variants: [{ capacity: '4L' }, { capacity: '6L' }],
      material: 'Plástico BPA Free',
      capacity: '4L',
      dishwasherSafe: false,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Cafetera Programable 12 Tazas',
      category: 'cocina',
      price: 75,
      originalPrice: 150,
      discountPercent: 50,
      stock: 20,
      imageUrl: '/assets/products/cafetera-programable.webp',
      storeId: homeStore.slug,
      tags: ['cafetera', 'desayuno', 'programable', 'oferta'],
      brand: 'BlendMaster',
      variants: [{ cups: 12 }, { color: 'negro' }],
      material: 'Acero + vidrio',
      capacity: '12 tazas',
      dishwasherSafe: true,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Tabla de Cortar Bambú',
      category: 'cocina',
      price: 24,
      stock: 38,
      imageUrl: '/assets/products/tabla-bambu.jpg',
      storeId: homeStore.slug,
      tags: ['tabla', 'bambu', 'cocina'],
      brand: 'ChefPro',
      variants: [{ size: 'mediana' }, { size: 'grande' }],
      material: 'Bambú',
      capacity: 'N/A',
      dishwasherSafe: false,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Set Cuchillos Profesional',
      category: 'cocina',
      price: 88,
      stock: 13,
      imageUrl: '/assets/products/cuchillos.jpg',
      storeId: homeStore.slug,
      tags: ['cuchillos', 'chef', 'set'],
      brand: 'ChefPro',
      variants: [{ pieces: 6 }, { pieces: 9 }],
      material: 'Acero inoxidable',
      capacity: '6 piezas',
      dishwasherSafe: false,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      name: 'Tostadora Retro 2 Rebanadas',
      category: 'cocina',
      price: 46,
      stock: 31,
      imageUrl: '/assets/products/tostadora-retro.jpg',
      storeId: homeStore.slug,
      tags: ['tostadora', 'retro', 'desayuno'],
      brand: 'BlendMaster',
      variants: [{ color: 'rojo' }, { color: 'crema' }],
      material: 'Acero + plástico',
      capacity: '2 rebanadas',
      dishwasherSafe: false,
      ovenSafe: false,
      createdAt: new Date(), updatedAt: new Date(),
    }
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
