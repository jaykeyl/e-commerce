# Endpoints principales — MultiStore

## 1. Autenticación

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/auth/register` | Registra un usuario. | Público |
| POST | `/api/auth/login` | Inicia sesión y devuelve JWT. | Público |

---

## 2. Productos

| Método | Endpoint | Descripción | Base |
|---|---|---|---|
| GET | `/api/products` | Lista productos del catálogo. | MongoDB |
| GET | `/api/products/:id` | Obtiene detalle de un producto. | MongoDB |

El catálogo se almacena en MongoDB porque cada producto puede tener atributos dinámicos según su categoría.

---

## 3. Carrito

| Método | Endpoint | Descripción | Base |
|---|---|---|---|
| GET | `/api/cart` | Obtiene carrito del usuario autenticado. | MongoDB |
| POST | `/api/cart` | Agrega producto al carrito. | MongoDB |
| PATCH | `/api/cart/:productId` | Actualiza cantidad. | MongoDB |
| DELETE | `/api/cart/:productId` | Elimina producto del carrito. | MongoDB |
| DELETE | `/api/cart` | Vacía carrito. | MongoDB |

---

## 4. Órdenes

| Método | Endpoint | Descripción | Base |
|---|---|---|---|
| GET | `/api/orders/stores` | Lista tiendas disponibles para checkout. | PostgreSQL |
| POST | `/api/orders` | Crea orden, pago, factura y descuenta stock. | PostgreSQL + MongoDB |
| GET | `/api/orders` | Lista órdenes del usuario. | PostgreSQL |
| GET | `/api/orders/:id` | Obtiene detalle de una orden. | PostgreSQL |
| GET | `/api/orders/:id/invoice` | Obtiene factura de una orden. | PostgreSQL |
| PATCH | `/api/orders/:id/status` | Actualiza estado de orden. | PostgreSQL |

El endpoint `POST /api/orders` es el flujo más importante del sistema porque integra ambas bases de datos.

---

## 5. Reportes MongoDB

| Método | Endpoint | Operadores usados |
|---|---|---|
| GET | `/api/reports/products/expensive` | `$gt`, `$lt`, `$and` |
| GET | `/api/reports/products/by-tags` | `$in`, `$or` |
| GET | `/api/reports/products/low-stock` | `$lt` |
| GET | `/api/reports/products/dynamic-attributes` | Proyección BSON dinámica |
| GET | `/api/reports/products/variants` | `$or`, dot notation |
| GET | `/api/reports/products/category-summary` | `$group`, `$sum`, `$avg`, `$max`, `$min` |
| GET | `/api/reports/products/premium-or-low-stock` | `$or`, `$gt`, `$lt` |

---

## 6. Reportes PostgreSQL

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reports/sales` | Agrupa ventas por tienda y estado. |
| GET | `/api/reports/invoices/summary` | Lista resumen de facturación. |

---

## 7. Integración cliente

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reports/customers/:userId/profile` | Perfil integrado PostgreSQL + MongoDB. |

Este endpoint muestra datos relacionales del usuario junto con documentos de MongoDB como carrito, preferencias y auditorías.
