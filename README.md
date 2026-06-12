# MultiStore — Sistema E-commerce Multitienda con Persistencia Políglota

MultiStore es una plataforma de e-commerce multitienda desarrollada como práctica final de Base de Datos Avanzada. El sistema implementa una arquitectura híbrida de persistencia políglota, integrando PostgreSQL para los datos transaccionales y MongoDB para el catálogo dinámico de productos.

El proyecto permite registrar usuarios, autenticar clientes y administradores, consultar productos, administrar carrito, generar órdenes de compra, registrar pagos, emitir facturas y visualizar reportes avanzados sobre la información almacenada en ambas bases de datos.

---

## Objetivo del proyecto

Desarrollar una plataforma integral de e-commerce que combine bases de datos relacionales y NoSQL, separando responsabilidades según la naturaleza de los datos:

- PostgreSQL gestiona usuarios, roles, tiendas, direcciones, órdenes, pagos y facturas.
- MongoDB gestiona catálogo de productos, carritos, auditorías de checkout y datos documentales flexibles.
- La API integra ambas bases mediante identificadores únicos y referencias cruzadas.

Esta arquitectura permite demostrar normalización relacional, transacciones ACID, seguridad en pagos, consultas NoSQL avanzadas y flexibilidad documental para productos con atributos dinámicos.

---

## Arquitectura general

```txt
Frontend React
     |
     v
API REST Express + TypeScript
     |
     |-------------------- PostgreSQL
     |                     - Usuarios
     |                     - Roles RBAC
     |                     - Tiendas
     |                     - Direcciones
     |                     - Órdenes
     |                     - Pagos
     |                     - Facturas
     |
     |-------------------- MongoDB
                           - Catálogo dinámico
                           - Carritos
                           - Auditoría de checkout
                           - Preferencias/documentos flexibles
```

---

## Tecnologías utilizadas

### Frontend

- React
- TypeScript
- Vite
- CSS personalizado
- React Router

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT para autenticación
- Middleware de roles RBAC
- Crypto de Node.js para cifrado/tokenización

### Bases de datos

- PostgreSQL para persistencia relacional y transaccional.
- MongoDB para persistencia documental y catálogo dinámico.
- Mongo Express para inspección visual de documentos.

### Infraestructura local

- Docker Compose
- PostgreSQL container
- MongoDB container
- Mongo Express container

---

## Módulo relacional — PostgreSQL

PostgreSQL almacena los datos que requieren consistencia fuerte, relaciones normalizadas y operaciones transaccionales.

Entidades principales:

- `Role`: roles del sistema.
- `User`: clientes, administradores y encargados.
- `Address`: direcciones de entrega.
- `Store`: tiendas participantes.
- `Order`: órdenes de compra.
- `OrderItem`: detalle de productos comprados.
- `Payment`: pagos asociados a órdenes.
- `Invoice`: facturación formal.

El modelo relacional se encuentra normalizado y evita duplicación innecesaria de información. Las órdenes, pagos y facturas se crean mediante una transacción ACID usando Prisma, garantizando que el proceso de compra no quede incompleto si ocurre un error.

---

## Módulo NoSQL — MongoDB

MongoDB almacena el catálogo de productos y datos flexibles que pueden variar según la categoría.

Cada producto puede tener campos dinámicos diferentes. Por ejemplo:

- Electrónica: voltaje, conectividad, garantía.
- Ropa: tallas, colores, material.
- Muebles: dimensiones, peso, material.
- Cocina: capacidad, resistencia al horno, apto para lavavajillas.
- Adornos: estilo, temática, material.

También se utilizan arreglos como:

- `tags`
- `variants`
- `sizes`
- `colors`
- `brands`

Esto permite realizar consultas flexibles usando operadores como `$gt`, `$lt`, `$and`, `$or`, `$in` y dot notation sobre arreglos.

---

## Integración entre PostgreSQL y MongoDB

La integración entre bases se realiza desde la API.

Flujo principal de compra:

1. El cliente agrega productos al carrito.
2. El carrito se almacena en MongoDB.
3. Al confirmar la compra, la API obtiene el carrito desde MongoDB.
4. La API valida stock en el catálogo de MongoDB.
5. PostgreSQL crea la orden, pago y factura dentro de una transacción ACID.
6. MongoDB descuenta stock del catálogo.
7. MongoDB registra una auditoría documental del checkout.
8. El carrito se vacía después de confirmar la orden.

La relación entre ambos motores se realiza mediante:

- `userId`: UUID del usuario relacional usado también en documentos MongoDB.
- `mongoProductId`: identificador del producto documental guardado en los ítems de la orden.
- `orderId`: identificador relacional referenciado en auditorías documentales.

---

## Seguridad

El sistema implementa varias medidas de seguridad:

- Autenticación con JWT.
- Control de acceso basado en roles.
- Rutas protegidas mediante middleware.
- Roles diferenciados: `ADMIN`, `CUSTOMER`, `STORE_MANAGER`.
- Operaciones SQL mediante Prisma ORM, reduciendo exposición a SQL Injection.
- No se almacena el número completo de tarjeta.
- Solo se guarda `cardLastFour`.
- Se genera un token cifrado para pagos con tarjeta.
- La facturación queda asociada a la orden y al pago correspondiente.

---

## Reportes implementados

El módulo de reportes permite demostrar consultas avanzadas en ambas bases de datos.

### Reportes MongoDB

- Productos por rango de precio: `$gt`, `$lt`, `$and`.
- Productos por tags o marcas: `$in`, `$or`.
- Productos con bajo stock: `$lt`.
- Atributos dinámicos BSON por categoría.
- Consulta por variantes usando dot notation.
- Resumen por categoría con aggregation pipeline: `$group`, `$sum`, `$avg`, `$max`, `$min`.
- Productos premium o con stock crítico: `$or`, `$gt`, `$lt`.

### Reportes PostgreSQL

- Ventas por tienda.
- Resumen de facturación.
- Relación entre órdenes, pagos, usuarios y tiendas.

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd e-commerce
```

### 2. Levantar bases de datos

```bash
docker compose up -d postgres mongodb mongo-express
```

Servicios disponibles:

```txt
PostgreSQL: localhost:5433
MongoDB: localhost:27018
Mongo Express: http://localhost:8082
```

### 3. Configurar backend

Entrar a la carpeta backend:

```bash
cd backend
npm install
```

Crear archivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ecommerce?schema=public"
MONGO_URI="mongodb://admin:admin123@localhost:27018/"
JWT_SECRET="multistore_super_secret_dev"
CARD_ENCRYPTION_SECRET="multistore_card_secret_dev"
PORT=3000
NODE_ENV=development
```

Sincronizar Prisma con PostgreSQL:

```bash
npx prisma db push
npx prisma generate
```

Cargar datos de prueba:

```bash
npm run db:seed
```

Levantar backend:

```bash
npm run dev
```

Backend disponible en:

```txt
http://localhost:3000
```

### 4. Configurar frontend

En otra terminal:

```bash
cd frontend
npm install
```

Crear archivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

Levantar frontend:

```bash
npm run dev
```

Frontend disponible en:

```txt
http://localhost:5173
```

---

## Usuarios de prueba

### Administrador

```txt
Email: admin@ecommerce.com
Password: admin123
```

### Cliente

```txt
Email: cliente@ejemplo.com
Password: pass123
```

---

## Guía rápida de demo

### Flujo cliente

1. Iniciar sesión como cliente.
2. Ver productos disponibles.
3. Agregar productos al carrito.
4. Finalizar compra.
5. Confirmar dirección y tienda.
6. Crear orden.
7. Ver pedido generado.

### Flujo administrador

1. Iniciar sesión como administrador.
2. Entrar a Reportes.
3. Ejecutar reportes MongoDB.
4. Ejecutar ventas por tienda.
5. Ejecutar resumen de facturación.
6. Mostrar Mongo Express con `products` y `order_audit`.
7. Explicar la separación entre PostgreSQL y MongoDB.

---

## Estructura del proyecto

```txt
e-commerce/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── db/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── context/
│       └── api/
├── docs/
├── database/
├── docker-compose.yml
└── README.md
```

---

## Estado actual

El sistema cuenta con:

- Autenticación funcional.
- Roles RBAC.
- Catálogo MongoDB.
- Carrito documental.
- Checkout integrado.
- Orden relacional.
- Pago relacional.
- Factura relacional.
- Auditoría documental en MongoDB.
- Reportes avanzados MongoDB.
- Reportes transaccionales PostgreSQL.
- Frontend administrativo y cliente.
