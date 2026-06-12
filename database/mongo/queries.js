// Consultas MongoDB — MultiStore
// Estas consultas pueden ejecutarse en Mongo Shell o adaptarse en Mongo Express.

// 1. Productos activos entre un rango de precio
db.products.find({
  $and: [
    { price: { $gt: 100 } },
    { price: { $lt: 1000 } },
    { stock: { $gt: 0 } }
  ]
});

// 2. Productos por tags o marcas
db.products.find({
  $or: [
    { tags: { $in: ["oferta", "nuevo"] } },
    { brand: { $in: ["Lenovo", "Samsung"] } }
  ]
});

// 3. Productos con bajo stock
db.products.find({
  stock: { $lt: 10 }
}).sort({ stock: 1 });

// 4. Productos con variantes por color o talla
db.products.find({
  $or: [
    { "variants.color": "gris" },
    { colors: "gris" },
    { "variants.size": "M" },
    { sizes: "M" }
  ]
});

// 5. Productos premium o con stock crítico
db.products.find({
  $or: [
    { price: { $gt: 500 } },
    { stock: { $lt: 10 } }
  ]
});

// 6. Resumen por categoría
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
  },
  { $sort: { totalProducts: -1 } }
]);

// 7. Auditoría de checkout
db.order_audit.find().sort({ createdAt: -1 });
