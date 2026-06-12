# Diagrama de Flujo de Datos — MultiStore

## 1. Flujo general del sistema

```txt
Usuario
  │
  ▼
Frontend React
  │
  ▼
API REST Express
  │
  ├── Autenticación JWT
  ├── Validación de rol RBAC
  ├── Servicios de negocio
  │
  ├── PostgreSQL
  │     ├── Usuarios
  │     ├── Roles
  │     ├── Direcciones
  │     ├── Órdenes
  │     ├── Pagos
  │     └── Facturas
  │
  └── MongoDB
        ├── Productos
        ├── Carritos
        ├── Auditorías
        └── Preferencias
```

---

## 2. Flujo de autenticación

```txt
Cliente/Admin
  │
  │ email + password
  ▼
POST /api/auth/login
  │
  ├── Verifica credenciales en PostgreSQL
  ├── Obtiene rol del usuario
  └── Genera token JWT
        │
        ▼
Frontend guarda token en localStorage
```

---

## 3. Flujo de catálogo

```txt
Frontend Productos
  │
  ▼
GET /api/products
  │
  ▼
API consulta MongoDB
  │
  ▼
Colección products
  │
  ├── Categorías
  ├── Atributos dinámicos
  ├── Tags
  ├── Variantes
  └── Stock
```

MongoDB es usado en este flujo porque el catálogo contiene atributos variables según la categoría.

---

## 4. Flujo de carrito

```txt
Cliente agrega producto
  │
  ▼
POST /api/cart
  │
  ├── Valida producto en MongoDB
  └── Guarda item en colección carts
        │
        ▼
Documento carrito por userId
```

El carrito se almacena en MongoDB porque es un documento temporal, flexible y asociado al usuario.

---

## 5. Flujo de checkout

```txt
Cliente confirma compra
  │
  ▼
POST /api/orders
  │
  ├── Obtiene carrito desde MongoDB
  ├── Valida stock en productos MongoDB
  ├── Calcula total
  │
  ├── Inicia transacción PostgreSQL
  │     ├── Crea Order
  │     ├── Crea OrderItem
  │     ├── Crea Payment
  │     └── Crea Invoice
  │
  ├── Descuenta stock en MongoDB
  ├── Registra order_audit en MongoDB
  └── Vacía carrito
```

Este flujo demuestra la integración entre ambos motores.

---

## 6. Flujo de facturación

```txt
Orden creada
  │
  ▼
Servicio de facturación
  │
  ├── Genera invoiceNumber
  ├── Calcula subtotal
  ├── Calcula impuesto
  └── Guarda Invoice en PostgreSQL
```

La factura se crea dentro de la misma transacción que la orden y el pago.

---

## 7. Flujo de reportes

```txt
Admin entra a Reportes
  │
  ├── Reportes MongoDB
  │     ├── Rango de precio
  │     ├── Tags y marcas
  │     ├── Bajo stock
  │     ├── Atributos dinámicos
  │     ├── Variantes
  │     └── Resumen por categoría
  │
  └── Reportes PostgreSQL
        ├── Ventas por tienda
        └── Resumen de facturación
```

El módulo de reportes permite demostrar la arquitectura políglota de forma visual.
