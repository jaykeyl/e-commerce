# Consultas MongoDB — MultiStore

Este documento resume las consultas MongoDB implementadas en los reportes del sistema.

---

## 1. Productos por rango de precio

Endpoint:

```txt
GET /api/reports/products/expensive?minPrice=100&maxPrice=1000
```

Consulta equivalente:

```js
db.products.find({
  $and: [
    { price: { $gt: 100 } },
    { price: { $lt: 1000 } },
    { stock: { $gt: 0 } }
  ]
})
```

Operadores usados:

- `$gt`
- `$lt`
- `$and`

---

## 2. Productos por tags o marcas

Endpoint:

```txt
GET /api/reports/products/by-tags?tags=oferta,nuevo&brands=Lenovo,Samsung
```

Consulta equivalente:

```js
db.products.find({
  $or: [
    { tags: { $in: ["oferta", "nuevo"] } },
    { brand: { $in: ["Lenovo", "Samsung"] } }
  ]
})
```

Operadores usados:

- `$or`
- `$in`

---

## 3. Productos con bajo stock

Endpoint:

```txt
GET /api/reports/products/low-stock?threshold=10
```

Consulta equivalente:

```js
db.products.find({
  stock: { $lt: 10 }
})
```

Operador usado:

- `$lt`

---

## 4. Consulta por variantes

Endpoint:

```txt
GET /api/reports/products/variants?color=gris&size=M
```

Consulta equivalente:

```js
db.products.find({
  $or: [
    { "variants.color": "gris" },
    { colors: "gris" },
    { "variants.size": "M" },
    { sizes: "M" }
  ]
})
```

Técnicas usadas:

- `$or`
- Dot notation sobre arreglos.
- Consulta en campos dinámicos.

---

## 5. Productos premium o con stock crítico

Endpoint:

```txt
GET /api/reports/products/premium-or-low-stock?minPrice=500&threshold=10
```

Consulta equivalente:

```js
db.products.find({
  $or: [
    { price: { $gt: 500 } },
    { stock: { $lt: 10 } }
  ]
})
```

Operadores usados:

- `$or`
- `$gt`
- `$lt`

---

## 6. Resumen por categoría

Endpoint:

```txt
GET /api/reports/products/category-summary
```

Pipeline equivalente:

```js
db.products.aggregate([
  {
    $group: {
      _id: "$category",
      totalProducts: { $sum: 1 },
      totalStock: { $sum: "$stock" },
      averagePrice: { $avg: "$price" },
      maxPrice: { $max: "$price" },
      minPrice: { $min: "$price" },
      brands: { $addToSet: "$brand" }
    }
  },
  {
    $project: {
      _id: 0,
      category: "$_id",
      totalProducts: 1,
      totalStock: 1,
      averagePrice: { $round: ["$averagePrice", 2] },
      maxPrice: 1,
      minPrice: 1,
      brands: 1,
      brandCount: { $size: "$brands" }
    }
  }
])
```

Operadores usados:

- `$group`
- `$sum`
- `$avg`
- `$max`
- `$min`
- `$addToSet`
- `$project`
- `$round`
- `$size`

---

## 7. Atributos dinámicos BSON

Endpoint:

```txt
GET /api/reports/products/dynamic-attributes
```

Este reporte no solo filtra productos, sino que muestra qué campos dinámicos tiene cada producto. Sirve para evidenciar que MongoDB permite manejar productos con estructuras diferentes según su categoría.
