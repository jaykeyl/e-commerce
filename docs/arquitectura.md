# Arquitectura del Sistema — MultiStore

## 1. Descripción general

MultiStore es un sistema de e-commerce multitienda diseñado con una arquitectura de persistencia políglota. Esto significa que el sistema no depende de una sola base de datos para todo, sino que utiliza diferentes motores de almacenamiento según la naturaleza de los datos.

La solución integra:

- **PostgreSQL** para información relacional, transaccional y normalizada.
- **MongoDB** para catálogo flexible, carritos, auditoría documental y estructuras dinámicas.
- **API REST con Express y TypeScript** como capa de integración entre ambas bases de datos.
- **Frontend React** para la interacción de clientes y administradores.

---

## 2. Justificación de la arquitectura políglota

La práctica requiere separar responsabilidades entre datos transaccionales y datos flexibles. Por eso, MultiStore utiliza:

### PostgreSQL

Se utiliza cuando los datos requieren:

- Consistencia fuerte.
- Relaciones entre entidades.
- Integridad referencial.
- Normalización.
- Transacciones ACID.
- Control seguro de pagos y facturación.

En PostgreSQL se almacenan:

- Usuarios.
- Roles.
- Direcciones.
- Tiendas.
- Órdenes.
- Detalles de órdenes.
- Pagos.
- Facturas.

### MongoDB

Se utiliza cuando los datos requieren:

- Flexibilidad de esquema.
- Atributos dinámicos por categoría.
- Documentos con arreglos.
- Consultas sobre campos variables.
- Almacenamiento de carritos y auditorías.

En MongoDB se almacenan:

- Productos.
- Carritos.
- Auditoría de checkout.
- Preferencias de usuarios.

---

## 3. Diagrama general de componentes

```txt
┌────────────────────────────┐
│        Frontend React       │
│  Cliente / Admin Dashboard  │
└──────────────┬─────────────┘
               │ HTTP / JSON
               ▼
┌────────────────────────────┐
│ API REST Express + TS       │
│ Autenticación + RBAC        │
│ Servicios de integración    │
└───────┬────────────────┬───┘
        │                │
        ▼                ▼
┌───────────────┐   ┌────────────────┐
│ PostgreSQL    │   │ MongoDB        │
│ Relacional    │   │ Documental     │
├───────────────┤   ├────────────────┤
│ Roles         │   │ Productos      │
│ Usuarios      │   │ Carritos       │
│ Tiendas       │   │ Auditoría      │
│ Direcciones   │   │ Preferencias   │
│ Órdenes       │   │ Catálogo BSON  │
│ Pagos         │   └────────────────┘
│ Facturas      │
└───────────────┘
```

---

## 4. Flujo de compra integrado

El flujo principal demuestra la integración entre PostgreSQL y MongoDB:

1. El cliente inicia sesión mediante JWT.
2. El frontend muestra productos almacenados en MongoDB.
3. El cliente agrega productos al carrito.
4. El carrito se guarda como documento en MongoDB.
5. Al confirmar la compra, la API recupera el carrito desde MongoDB.
6. La API valida que exista stock suficiente en MongoDB.
7. PostgreSQL crea orden, pago y factura dentro de una transacción ACID.
8. MongoDB descuenta el stock del catálogo.
9. MongoDB registra un documento de auditoría de checkout.
10. El carrito se elimina después de confirmar la orden.

---

## 5. Integración por identificadores

La integración entre bases se realiza mediante identificadores compartidos:

| Identificador | Ubicación | Función |
|---|---|---|
| `userId` | PostgreSQL y MongoDB | Relaciona usuario relacional con carrito, preferencias y auditorías documentales. |
| `mongoProductId` | MongoDB y PostgreSQL | Permite guardar productos del catálogo MongoDB dentro de `OrderItem` relacional. |
| `orderId` | PostgreSQL y MongoDB | Relaciona la orden relacional con la auditoría documental. |
| `invoiceId` | PostgreSQL y MongoDB | Permite rastrear la factura desde auditoría documental. |

---

## 6. Beneficios de la solución

La arquitectura permite:

- Mantener consistencia en pagos, órdenes y facturas.
- Usar MongoDB para productos con atributos variables.
- Evitar esquemas rígidos para categorías de producto.
- Demostrar consultas avanzadas NoSQL.
- Separar responsabilidades de almacenamiento.
- Facilitar la defensa técnica del proyecto mediante reportes visuales.
