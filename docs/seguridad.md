# Seguridad — MultiStore

## 1. Autenticación

El sistema utiliza autenticación mediante JWT.

Flujo:

1. El usuario envía email y contraseña.
2. El backend valida credenciales.
3. Si son correctas, genera un token JWT.
4. El frontend guarda el token.
5. Las rutas protegidas requieren el token en el header `Authorization`.

---

## 2. Control de acceso RBAC

El sistema usa control de acceso basado en roles.

Roles principales:

- `ADMIN`
- `CUSTOMER`
- `STORE_MANAGER`

Ejemplos:

- Solo `ADMIN` puede acceder a ciertos reportes transaccionales.
- `ADMIN` y `STORE_MANAGER` pueden acceder a reportes de productos.
- `CUSTOMER` puede comprar y ver sus propias órdenes.

---

## 3. Protección contra SQL Injection

El acceso a PostgreSQL se realiza mediante Prisma ORM. Esto reduce el riesgo de SQL Injection porque las consultas se construyen mediante métodos del ORM y parámetros tipados, no concatenando SQL manualmente.

Ejemplo:

```ts
await prisma.user.findUnique({
  where: { id: userId }
})
```

---

## 4. Seguridad en pagos

El sistema no almacena el número completo de tarjeta.

En su lugar:

- Se guarda solo `cardLastFour`.
- Se genera un token cifrado.
- El token se almacena en `cardTokenEncrypted`.

Esto permite demostrar una estrategia básica de protección de datos sensibles.

---

## 5. Cifrado/tokenización

El servicio `crypto.service.ts` utiliza el módulo `crypto` de Node.js para generar un token cifrado asociado a la tarjeta.

El payload interno incluye:

- Tipo de token.
- Últimos 4 dígitos.
- Fingerprint hash.
- Fecha de creación.

El número completo de tarjeta no queda disponible en texto plano.

---

## 6. Auditoría

El checkout registra auditoría en MongoDB mediante la colección `order_audit`.

Esta auditoría contiene:

- Usuario.
- Orden.
- Tienda.
- Total.
- Pago.
- Factura.
- Método de pago.
- Bases integradas.

Esto permite rastrear la operación sin sobrecargar el modelo relacional.
