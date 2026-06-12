# Modelo Relacional — PostgreSQL

## 1. Propósito

PostgreSQL se utiliza para almacenar los datos estructurados y transaccionales del sistema. Estos datos requieren consistencia, integridad referencial y normalización.

---

## 2. Entidades principales

### Role

Representa los roles del sistema.

Campos principales:

- `id`
- `name`

Roles esperados:

- `ADMIN`
- `CUSTOMER`
- `STORE_MANAGER`

---

### User

Representa a los usuarios del sistema.

Campos principales:

- `id`
- `email`
- `passwordHash`
- `firstName`
- `lastName`
- `phone`
- `roleId`

Relaciones:

- Un usuario pertenece a un rol.
- Un usuario puede tener varias direcciones.
- Un usuario puede tener varias órdenes.
- Un usuario puede tener varios pagos.

---

### Address

Representa las direcciones de entrega.

Campos principales:

- `id`
- `userId`
- `street`
- `city`
- `state`
- `country`
- `postalCode`
- `isDefault`

---

### Store

Representa las tiendas participantes del marketplace.

Campos principales:

- `id`
- `name`
- `slug`
- `description`

Relaciones:

- Una tienda puede tener varias órdenes.
- Una tienda puede aparecer en varios ítems de orden.

---

### Order

Representa una compra confirmada.

Campos principales:

- `id`
- `userId`
- `storeId`
- `addressId`
- `status`
- `totalAmount`
- `currency`

Relaciones:

- Una orden pertenece a un usuario.
- Una orden pertenece a una tienda.
- Una orden tiene una dirección.
- Una orden tiene varios ítems.
- Una orden tiene un pago.
- Una orden tiene una factura.

---

### OrderItem

Representa el detalle de productos comprados.

Campos principales:

- `id`
- `orderId`
- `storeId`
- `mongoProductId`
- `productName`
- `productSku`
- `quantity`
- `unitPrice`
- `subtotal`

El campo `mongoProductId` conecta el ítem relacional con el producto almacenado en MongoDB.

---

### Payment

Representa el pago de una orden.

Campos principales:

- `id`
- `orderId`
- `userId`
- `method`
- `status`
- `amount`
- `cardLastFour`
- `cardTokenEncrypted`
- `transactionRef`

Por seguridad, no se guarda el número completo de tarjeta.

---

### Invoice

Representa la factura generada para una orden.

Campos principales:

- `id`
- `orderId`
- `invoiceNumber`
- `nit`
- `businessName`
- `subtotal`
- `taxAmount`
- `totalAmount`
- `status`
- `issuedAt`

---

## 3. Normalización

El diseño relacional evita duplicación innecesaria de información:

- Los roles están separados de los usuarios.
- Las direcciones se almacenan en una tabla independiente.
- Las órdenes se separan de sus ítems.
- Los pagos se separan de las órdenes.
- Las facturas se separan de pagos y órdenes, pero están relacionadas con ellas.

Esto permite mantener una estructura cercana a tercera forma normal.

---

## 4. Transacciones ACID

El proceso de checkout utiliza una transacción en PostgreSQL para crear:

- Orden.
- Ítems de orden.
- Pago.
- Factura.

Si una operación falla dentro de la transacción, el proceso completo se revierte y no queda información parcial en PostgreSQL.
