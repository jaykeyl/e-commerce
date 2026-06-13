import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  store?: { name: string };
  payment?: {
    method: string;
    status: string;
    cardLastFour?: string | null;
  } | null;
  items: { productName: string; quantity: number; unitPrice: string; subtotal?: string }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  nit: string;
  businessName: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
  issuedAt: string;
  order: {
    id: string;
    createdAt: string;
    store?: { name: string };
    payment?: {
      method: string;
      status: string;
      cardLastFour?: string | null;
    } | null;
    address?: {
      street: string;
      city: string;
      country: string;
    };
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    items: {
      productName: string;
      quantity: number;
      unitPrice: string;
      subtotal: string;
    }[];
  };
}

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
  </svg>
);

const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const IconEmptyOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <line x1="8" y1="8" x2="16" y2="8"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="16" x2="13" y2="16"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const STATUS_CONFIG: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  PENDING:    { label: 'Pendiente',   icon: <IconClock />,   color: 'var(--warning)' },
  CONFIRMED:  { label: 'Confirmado',  icon: <IconCheck />,   color: 'var(--success)' },
  PROCESSING: { label: 'Procesando',  icon: <IconRefresh />, color: 'var(--info)' },
  SHIPPED:    { label: 'Enviado',     icon: <IconTruck />,   color: 'var(--info)' },
  DELIVERED:  { label: 'Entregado',   icon: <IconCheck />,   color: 'var(--success)' },
  CANCELLED:  { label: 'Cancelado',   icon: <IconX />,       color: 'var(--danger)' },
  REFUNDED:   { label: 'Reembolsado', icon: <IconRefresh />, color: 'var(--text-muted)' },
};

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Transferencia bancaria',
  CASH_ON_DELIVERY: 'Pago contra entrega',
};

function money(value: string | number | undefined | null) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const successId = searchParams.get('success');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.get('/orders')
      .then(data => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const openInvoice = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setInvoice(null);
    setInvoiceError('');
    setInvoiceLoading(true);

    try {
      const data = await api.get(`/orders/${orderId}/invoice`);
      setInvoice(data);
    } catch (err: any) {
      setInvoiceError(err.message || 'No se pudo cargar la factura');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoice = () => {
    setInvoice(null);
    setInvoiceError('');
    setInvoiceLoading(false);
    setSelectedOrderId('');
  };

  if (loading) return <div className="page loading">Cargando pedidos...</div>;

  return (
    <div className="page">
      <div className="page-header orders-page-header">
        <div>
          <h1 className="page-title">Mis <span>Pedidos</span></h1>
          <p className="page-subtitle">
            Historial de compras, pagos y facturas generadas automáticamente.
          </p>
        </div>

        {orders.length > 0 && (
          <div className="orders-kpis">
            <div>
              <strong>{orders.length}</strong>
              <span>Pedidos</span>
            </div>
            <div>
              <strong>{money(orders.reduce((acc, order) => acc + Number(order.totalAmount), 0))}</strong>
              <span>Total comprado</span>
            </div>
          </div>
        )}
      </div>

      {successId && (
        <div className="order-success-toast">
          <div className="order-success-icon">
            <IconCheck />
          </div>
          <div>
            <strong>Pedido creado exitosamente</strong>
            <span>
              ID: <code>{successId.slice(0, 8)}...</code>
            </span>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><IconEmptyOrders /></div>
          <p>No tienes pedidos aún.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ir a comprar</button>
        </div>
      ) : (
        <div className="orders-list enhanced-orders-list">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || { label: order.status, icon: <IconClock />, color: 'var(--text-muted)' };

            return (
              <div key={order.id} className={`order-card enhanced-order-card ${successId === order.id ? 'highlight-order' : ''}`}>
                <div className="order-header enhanced-order-header">
                  <div className="order-main-info">
                    <code className="order-id">{order.id.slice(0, 8)}...</code>
                    <span className="order-status" style={{ color: sc.color }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  <div className="order-date-box">
                    <span>{new Date(order.createdAt).toLocaleDateString('es-BO')}</span>
                  </div>
                </div>

                <div className="order-meta-grid">
                  {order.store && (
                    <div className="order-meta-item">
                      <IconStore />
                      <div>
                        <small>Tienda</small>
                        <strong>{order.store.name}</strong>
                      </div>
                    </div>
                  )}

                  <div className="order-meta-item">
                    <IconReceipt />
                    <div>
                      <small>Factura</small>
                      <strong>Generada automáticamente</strong>
                    </div>
                  </div>

                  <div className="order-meta-item">
                    <IconShield />
                    <div>
                      <small>Pago seguro</small>
                      <strong>{order.payment?.method ? PAYMENT_LABELS[order.payment.method] || order.payment.method : 'Registrado'}</strong>
                    </div>
                  </div>
                </div>

                <div className="order-items enhanced-order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row enhanced-order-item-row">
                      <span>{item.productName}</span>
                      <span>x{item.quantity}</span>
                      <span>{money(item.unitPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <button className="btn-secondary invoice-btn" onClick={() => openInvoice(order.id)}>
                    <IconReceipt /> Ver factura
                  </button>

                  <div className="order-total">
                    Total: <strong>{money(order.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrderId && (
        <div className="invoice-overlay" onClick={closeInvoice}>
          <div className="invoice-modal" onClick={e => e.stopPropagation()}>
            <button className="invoice-close" onClick={closeInvoice} aria-label="Cerrar factura">
              <IconX />
            </button>

            {invoiceLoading && (
              <div className="invoice-state">
                <div className="loading">Cargando factura...</div>
              </div>
            )}

            {invoiceError && (
              <div className="invoice-state">
                <div className="error-msg">{invoiceError}</div>
              </div>
            )}

            {invoice && (
              <>
                <div className="invoice-top">
                  <div>
                    <div className="invoice-brand">
                      <div className="invoice-logo">M</div>
                      <div>
                        <strong>MultiStore</strong>
                        <span>E-commerce multitienda</span>
                      </div>
                    </div>
                  </div>

                  <div className="invoice-number-box">
                    <small>Factura</small>
                    <strong>{invoice.invoiceNumber}</strong>
                    <span>{new Date(invoice.issuedAt).toLocaleString('es-BO')}</span>
                  </div>
                </div>

                <div className="invoice-status-row">
                  <span className="invoice-pill issued">Factura {invoice.status}</span>
                  <span className="invoice-pill secure"><IconShield /> Pago protegido</span>
                  <span className="invoice-pill db">PostgreSQL + MongoDB</span>
                </div>

                <div className="invoice-info-grid">
                  <div>
                    <small>Facturado a</small>
                    <strong>{invoice.businessName}</strong>
                    <span>NIT/CI: {invoice.nit || '0'}</span>
                    {invoice.order?.user && (
                      <span>{invoice.order.user.email}</span>
                    )}
                  </div>

                  <div>
                    <small>Tienda</small>
                    <strong>{invoice.order?.store?.name || 'MultiStore'}</strong>
                    {invoice.order?.address && (
                      <span>
                        {invoice.order.address.street}, {invoice.order.address.city}
                      </span>
                    )}
                  </div>

                  <div>
                    <small>Pago</small>
                    <strong>
                      {invoice.order?.payment?.method
                        ? PAYMENT_LABELS[invoice.order.payment.method] || invoice.order.payment.method
                        : 'Pago registrado'}
                    </strong>
                    <span>Estado: {invoice.order?.payment?.status || 'PENDING'}</span>
                    {invoice.order?.payment?.cardLastFour && (
                      <span>Tarjeta terminada en {invoice.order.payment.cardLastFour}</span>
                    )}
                  </div>
                </div>

                <div className="invoice-items">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.order.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{money(item.unitPrice)}</td>
                          <td>{money(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-bottom">
                  <div className="invoice-note">
                    <IconShield />
                    <p>
                      La orden, el pago y la factura fueron registrados en PostgreSQL mediante una transacción ACID.
                      El catálogo, carrito y auditoría de checkout se gestionan en MongoDB.
                    </p>
                  </div>

                  <div className="invoice-totals">
                    <div>
                      <span>Subtotal</span>
                      <strong>{money(invoice.subtotal)}</strong>
                    </div>
                    <div>
                      <span>Impuesto</span>
                      <strong>{money(invoice.taxAmount)}</strong>
                    </div>
                    <div className="grand-total">
                      <span>Total</span>
                      <strong>{money(invoice.totalAmount)}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}