# Guía de Demo — MultiStore

Esta guía indica el orden recomendado para defender el proyecto.

---

## 1. Levantar el sistema

### Bases de datos

```bash
docker compose up -d postgres mongodb mongo-express
```

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## 2. Accesos

### Cliente

```txt
Email: cliente@ejemplo.com
Password: pass123
```

### Administrador

```txt
Email: admin@ecommerce.com
Password: admin123
```

---

## 3. Demo como cliente

1. Iniciar sesión como cliente.
2. Entrar a productos.
3. Agregar productos al carrito.
4. Ir al carrito.
5. Finalizar compra.
6. Elegir tienda y completar dirección.
7. Confirmar pedido.
8. Ver la orden generada.

Explicación sugerida:

> El cliente interactúa con productos almacenados en MongoDB. El carrito también se guarda en MongoDB como documento temporal. Al confirmar la compra, la API crea la orden, el pago y la factura en PostgreSQL mediante una transacción ACID.

---

## 4. Mostrar Mongo Express

Abrir:

```txt
http://localhost:8082
```

Mostrar:

- `products`
- `carts`
- `order_audit`

Explicación sugerida:

> MongoDB almacena el catálogo flexible y la auditoría documental del checkout. Cada producto puede tener atributos distintos según su categoría.

---

## 5. Demo como administrador

1. Cerrar sesión.
2. Iniciar sesión como administrador.
3. Entrar a Reportes.
4. Ejecutar los reportes MongoDB:
   - Productos por rango de precio.
   - Tags o marcas.
   - Bajo stock.
   - Atributos dinámicos BSON.
   - Variantes.
   - Resumen por categoría.
   - Premium o stock crítico.
5. Ejecutar reportes PostgreSQL:
   - Ventas por tienda.
   - Resumen de facturación.

Explicación sugerida:

> Los reportes demuestran que MongoDB se utiliza para consultas flexibles sobre documentos, arreglos y atributos dinámicos; mientras que PostgreSQL concentra las consultas transaccionales de órdenes, pagos y facturas.

---

## 6. Demo de factura

Después de realizar una compra nueva, abrir el reporte:

```txt
Resumen de facturación
```

También se puede probar desde consola del navegador:

```js
fetch('http://localhost:3000/api/orders/ORDER_ID/invoice', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

Explicación sugerida:

> Cada orden nueva genera automáticamente una factura asociada. La factura se crea dentro de la misma transacción que la orden y el pago.

---

## 7. Puntos clave para defensa

- PostgreSQL se usa para datos transaccionales.
- MongoDB se usa para catálogo dinámico.
- La API integra ambas bases.
- Se implementan roles RBAC.
- Se usan transacciones ACID.
- Se implementa facturación.
- No se guarda el número completo de tarjeta.
- Se usan consultas MongoDB con operadores avanzados.
- El dashboard de reportes evidencia la persistencia políglota.
