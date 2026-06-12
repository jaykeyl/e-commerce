# Modelo NoSQL — MongoDB

## 1. Propósito

MongoDB se utiliza para almacenar datos flexibles, dinámicos y documentales. En MultiStore, su uso principal es el catálogo de productos, carritos y auditorías.

---

## 2. Colecciones principales

### products

Almacena el catálogo de productos.

Ejemplo de producto:

```js
{
  _id: ObjectId("..."),
  name: "Laptop Lenovo IdeaPad",
  category: "electronica",
  brand: "Lenovo",
  price: 850,
  stock: 12,
  tags: ["nuevo", "oferta", "tecnologia"],
  variants: [
    { color: "gris", stock: 5 },
    { color: "negro", stock: 7 }
  ],
  voltage: "220V",
  warrantyMonths: 12,
  connectivity: ["wifi", "bluetooth"]
}
```

---

### carts

Almacena el carrito temporal del usuario.

```js
{
  userId: "uuid-del-usuario",
  items: [
    {
      productId: "id-producto-mongodb",
      quantity: 2
    }
  ],
  updatedAt: ISODate()
}
```

---

### order_audit

Almacena auditorías documentales de checkout.

```js
{
  userId: "uuid-del-usuario",
  orderId: "uuid-de-orden",
  storeId: 1,
  totalAmount: 1500,
  paymentId: "uuid-pago",
  invoiceId: "uuid-factura",
  invoiceNumber: "INV-20260612-1234",
  paymentMethod: "CASH_ON_DELIVERY",
  createdAt: ISODate(),
  integration: {
    relationalDB: "PostgreSQL",
    documentDB: "MongoDB",
    linkKey: "userId / mongoProductId"
  }
}
```

---

## 3. Atributos dinámicos por categoría

MongoDB permite que cada categoría tenga campos diferentes sin modificar un esquema global.

### Electrónica

- `voltage`
- `warrantyMonths`
- `connectivity`
- `power`
- `batteryLife`

### Ropa

- `sizes`
- `colors`
- `material`
- `gender`
- `fit`

### Muebles

- `dimensions`
- `material`
- `weight`
- `assemblyRequired`

### Cocina

- `capacity`
- `dishwasherSafe`
- `ovenSafe`
- `material`

### Adornos

- `style`
- `theme`
- `material`
- `colors`

---

## 4. Uso de arreglos

Los productos pueden tener arreglos como:

- `tags`
- `variants`
- `sizes`
- `colors`
- `connectivity`

Esto permite consultas flexibles usando `$in`, `$or` y dot notation.

Ejemplo:

```js
db.products.find({
  tags: { $in: ["oferta", "nuevo"] }
})
```

Ejemplo con variantes:

```js
db.products.find({
  "variants.color": "gris"
})
```

---

## 5. Justificación

MongoDB es adecuado para el catálogo porque:

- Las categorías no tienen los mismos atributos.
- Es fácil agregar nuevos campos sin migraciones relacionales.
- Permite almacenar arreglos y subdocumentos.
- Facilita consultas flexibles sobre productos.
