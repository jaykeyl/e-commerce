# MultiStore — Sistema E-commerce Multitienda con Persistencia Políglota

MultiStore es una plataforma de e-commerce multitienda desarrollada como práctica final de Base de Datos Avanzada. El sistema implementa una arquitectura híbrida de persistencia políglota, integrando PostgreSQL para los datos transaccionales y MongoDB para el catálogo dinámico de productos, carrito, preferencias y auditoría documental.

El proyecto permite registrar usuarios, autenticar clientes y administradores, consultar productos, administrar carrito, realizar checkout, generar órdenes de compra, registrar pagos, emitir facturas, visualizar reportes avanzados y consultar un dashboard administrativo con indicadores del sistema.

---

## Objetivo del proyecto

Desarrollar una plataforma integral de e-commerce que combine bases de datos relacionales y NoSQL, separando responsabilidades según la naturaleza de los datos:

- PostgreSQL gestiona usuarios, roles, tiendas, direcciones, órdenes, pagos y facturas.
- MongoDB gestiona catálogo de productos, carritos, auditorías de checkout y datos documentales flexibles.
- La API integra ambas bases mediante identificadores únicos y referencias cruzadas.

Esta arquitectura permite demostrar normalización relacional, transacciones ACID, seguridad en pagos, consultas NoSQL avanzadas, flexibilidad documental, atributos dinámicos BSON y una integración real entre motores de base de datos distintos.

---

## Arquitectura general

```txt
Frontend React + TypeScript
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
        |                     - Detalle de órdenes
        |                     - Pagos
        |                     - Facturas
        |
        |-------------------- MongoDB
                              - Catálogo dinámico
                              - Carritos
                              - Preferencias de usuario
                              - Auditoría documental de checkout
```

---

## Tecnologías utilizadas

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS personalizado
- Interfaz responsive
- Modo claro y oscuro

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT para autenticación
- Middleware de roles RBAC
- Crypto de Node.js para cifrado/tokenización de tarjetas

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

- Electrónica: voltaje, conectividad, garantía y potencia.
- Ropa: tallas, colores, género y material.
- Muebles: dimensiones, peso, armado y material.
- Cocina: capacidad, resistencia al horno y apto para lavavajillas.
- Adornos: estilo, temática, dimensiones y material.

También se utilizan arreglos como:

- `tags`
- `variants`
- `sizes`
- `colors`
- `connectivity`

Esto permite realizar consultas flexibles usando operadores como `$gt`, `$lt`, `$and`, `$or`, `$in`, aggregation pipeline y dot notation sobre arreglos y documentos embebidos.

---

## Integración entre PostgreSQL y MongoDB

La integración entre bases se realiza desde la API.

Flujo principal de compra:

1. El cliente consulta productos desde MongoDB.
2. El cliente agrega productos al carrito.
3. El carrito se almacena como documento en MongoDB.
4. Al confirmar la compra, la API obtiene el carrito desde MongoDB.
5. La API valida stock en el catálogo documental.
6. PostgreSQL crea la orden, el pago y la factura dentro de una transacción ACID.
7. MongoDB descuenta stock del catálogo.
8. MongoDB registra una auditoría documental del checkout.
9. El carrito se vacía después de confirmar la orden.
10. El cliente puede visualizar el pedido y la factura generada.

La relación entre ambos motores se realiza mediante:

- `userId`: UUID del usuario relacional usado también en documentos MongoDB.
- `mongoProductId`: identificador del producto documental guardado en los ítems de la orden.
- `orderId`: identificador relacional referenciado en auditorías documentales.
- `invoiceId`: identificador de la factura relacional guardado en auditoría.

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
- El checkout valida stock antes de confirmar la compra.

---

## Funcionalidades principales

### Cliente

- Registro e inicio de sesión.
- Visualización de catálogo de productos.
- Filtros y búsqueda de productos.
- Visualización de atributos dinámicos por producto.
- Carrito de compras almacenado en MongoDB.
- Checkout con selección de tienda, dirección, método de pago y datos de facturación.
- Creación de orden, pago y factura.
- Visualización de pedidos.
- Visualización de factura emitida.

### Administrador

- Dashboard ejecutivo con indicadores generales.
- Reportes avanzados de MongoDB.
- Reportes transaccionales de PostgreSQL.
- Visualización de ventas, facturación, stock bajo y categorías.
- Pantalla de arquitectura para explicar la persistencia políglota.
- Acceso a datos demo preparados para defensa.

---

## Reportes implementados

El módulo de reportes permite demostrar consultas avanzadas en ambas bases de datos.

### Reportes MongoDB

- Productos por rango de precio usando `$gt`, `$lt` y `$and`.
- Productos por tags o marcas usando `$in` y `$or`.
- Productos con bajo stock usando `$lt`.
- Atributos dinámicos BSON por categoría.
- Consulta por variantes usando dot notation.
- Resumen por categoría con aggregation pipeline: `$group`, `$sum`, `$avg`, `$max`, `$min`.
- Productos premium o con stock crítico usando `$or`, `$gt` y `$lt`.

### Reportes PostgreSQL

- Ventas por tienda.
- Resumen de facturación.
- Relación entre órdenes, pagos, usuarios y tiendas.
- Facturas emitidas.
- Total de ventas registradas.

---

## Dashboard administrativo

El dashboard administrativo resume el estado general del sistema y muestra:

- Ventas registradas.
- Facturas emitidas.
- Productos con stock bajo.
- Categorías dinámicas del catálogo.
- Estado de inventario.
- Facturación reciente.
- Explicación resumida de la persistencia políglota.
- Accesos rápidos a catálogo, carrito, arquitectura y reportes.

Este dashboard permite demostrar visualmente cómo PostgreSQL y MongoDB trabajan juntos dentro del flujo de compra.

---

## Datos demo

El seed del proyecto carga datos de prueba tanto en PostgreSQL como en MongoDB.

Incluye:

- Usuario administrador.
- Usuario cliente.
- Roles del sistema.
- Tiendas demo.
- Dirección de cliente.
- Catálogo de 11 productos en MongoDB.
- Productos con atributos dinámicos BSON.
- Productos con stock bajo.
- Preferencias de usuario en MongoDB.
- Órdenes demo.
- Pagos demo.
- Facturas demo.
- Auditoría documental de checkout en MongoDB.

Esto permite que el dashboard, los reportes, las órdenes y las facturas muestren información desde el primer inicio del sistema.

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
2. Entrar al catálogo.
3. Mostrar productos con categorías y atributos dinámicos.
4. Agregar productos al carrito.
5. Ver carrito documental.
6. Ir a checkout.
7. Seleccionar tienda.
8. Ingresar dirección.
9. Seleccionar método de pago.
10. Ingresar NIT o razón social.
11. Confirmar compra.
12. Ir a pedidos.
13. Abrir factura generada.

### Flujo administrador

1. Iniciar sesión como administrador.
2. Entrar al dashboard.
3. Mostrar ventas registradas, facturas emitidas y stock bajo.
4. Entrar a reportes.
5. Ejecutar reportes MongoDB.
6. Ejecutar reportes PostgreSQL.
7. Entrar a arquitectura.
8. Explicar separación entre PostgreSQL y MongoDB.
9. Mostrar Mongo Express con `products`, `user_preferences` y `order_audit`.
10. Explicar cómo se relacionan `userId`, `mongoProductId`, `orderId` e `invoiceId`.

---

## Endpoints principales

### Autenticación

```txt
POST /api/auth/register
POST /api/auth/login
```

### Productos

```txt
GET /api/products
GET /api/products/:id
```

### Carrito

```txt
GET /api/cart
POST /api/cart/add
DELETE /api/cart/item/:productId
DELETE /api/cart
```

### Órdenes y facturas

```txt
POST /api/orders
GET /api/orders
GET /api/orders/:id
GET /api/orders/:id/invoice
GET /api/orders/stores
```

### Reportes

```txt
GET /api/reports/products/expensive
GET /api/reports/products/by-tags
GET /api/reports/products/low-stock
GET /api/reports/products/dynamic-attributes
GET /api/reports/products/variants
GET /api/reports/products/category-summary
GET /api/reports/products/premium-or-low-stock
GET /api/reports/sales
GET /api/reports/invoices/summary
GET /api/reports/customers/:userId/profile
```

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
│       ├── db/
│       └── seed.ts
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── api/
├── docs/
├── database/
├── docker-compose.yml
└── README.md
```

---

## Pantallas implementadas

- Login y registro.
- Catálogo de productos.
- Carrito.
- Checkout.
- Pedidos.
- Factura visual.
- Dashboard administrativo.
- Reportes.
- Arquitectura del sistema.

---

## Estado actual

El sistema cuenta con:

- Autenticación funcional.
- Roles RBAC.
- Catálogo MongoDB con atributos dinámicos.
- Carrito documental.
- Checkout integrado.
- Orden relacional.
- Pago relacional.
- Factura relacional.
- Auditoría documental en MongoDB.
- Reportes avanzados MongoDB.
- Reportes transaccionales PostgreSQL.
- Dashboard administrativo.
- Pantalla visual de arquitectura.
- Datos demo completos.
- Frontend administrativo y cliente.
- Modo claro y oscuro.
