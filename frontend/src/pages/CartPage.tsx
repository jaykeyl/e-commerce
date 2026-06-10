import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  productId: string;
  quantity: number;
  product?: { name: string; price: number; stock: number; category: string };
}

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const CAT_ICONS: Record<string, JSX.Element> = {
  electronica: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  ropa: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>,
  muebles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/></svg>,
  adornos: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  cocina: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>,
};

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await api.get('/cart');
      setItems(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user]);

  const removeItem = async (productId: string) => {
    try {
      await api.del(`/cart/item/${productId}`);
      fetchCart();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.del('/cart');
      setItems([]); setTotal(0);
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  if (loading) return <div className="loading">Cargando carrito...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mi <span>Carrito</span></h1>
        <p className="page-subtitle">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
      </div>

      {msg && <div className="error-msg">{msg}</div>}

      {items.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><IconCart /></div>
          <p>Tu carrito está vacío.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ver productos</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-icon">
                  {CAT_ICONS[item.product?.category || ''] || <IconBox />}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product?.name || item.productId}</div>
                  <div className="cart-item-qty">Cantidad: {item.quantity}</div>
                </div>
                <div className="cart-item-price">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
                <button className="btn-remove" onClick={() => removeItem(item.productId)} title="Eliminar">
                  <IconX />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-title">Resumen del pedido</div>
            <div className="cart-summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="cart-summary-row"><span>Envío</span><span style={{ color: 'var(--success)' }}>Gratis</span></div>
            <div className="cart-summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <div className="cart-actions">
              <button className="btn-primary btn-large" onClick={() => navigate('/checkout')}>
                Proceder al pago <IconArrowRight />
              </button>
              <button className="cart-clear-btn" onClick={clearCart}>Vaciar carrito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
