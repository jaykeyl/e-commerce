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
  items: { productName: string; quantity: number; unitPrice: string }[];
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

const STATUS_CONFIG: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  PENDING:    { label: 'Pendiente',   icon: <IconClock />,   color: 'var(--warning)' },
  CONFIRMED:  { label: 'Confirmado',  icon: <IconCheck />,   color: 'var(--success)' },
  PROCESSING: { label: 'Procesando',  icon: <IconRefresh />, color: 'var(--info)' },
  SHIPPED:    { label: 'Enviado',     icon: <IconTruck />,   color: 'var(--info)' },
  DELIVERED:  { label: 'Entregado',   icon: <IconCheck />,   color: 'var(--success)' },
  CANCELLED:  { label: 'Cancelado',   icon: <IconX />,       color: 'var(--danger)' },
  REFUNDED:   { label: 'Reembolsado', icon: <IconRefresh />, color: 'var(--text-muted)' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const successId = searchParams.get('success');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then(data => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page loading">Cargando pedidos...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mis <span>Pedidos</span></h1>
      </div>

      {successId && (
        <div className="success-msg">
          <IconCheck /> Pedido creado exitosamente — ID: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{successId}</code>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><IconEmptyOrders /></div>
          <p>No tienes pedidos aún.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ir a comprar</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || { label: order.status, icon: <IconClock />, color: 'var(--text-muted)' };
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <code className="order-id">{order.id.slice(0, 8)}...</code>
                  <span className="order-status" style={{ color: sc.color }}>
                    {sc.icon} {sc.label}
                  </span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('es-BO')}</span>
                </div>
                {order.store && (
                  <div className="order-store"><IconStore /> {order.store.name}</div>
                )}
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span>{item.productName}</span>
                      <span>x{item.quantity}</span>
                      <span>${Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">Total: <strong>${Number(order.totalAmount).toFixed(2)}</strong></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
