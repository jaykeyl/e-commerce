export function generateInvoiceNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);

  return `INV-${year}${month}${day}-${random}`;
}

export function buildInvoiceAmounts(totalAmount: number) {
  const total = Number(totalAmount);

  // Para no alterar el total de la orden, se considera que el total ya incluye impuesto.
  const subtotal = Number((total / 1.13).toFixed(2));
  const taxAmount = Number((total - subtotal).toFixed(2));

  return {
    subtotal,
    taxAmount,
    totalAmount: total,
  };
}