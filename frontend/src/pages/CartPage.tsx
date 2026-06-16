import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    stock: number;
    category: string;
    brand?: string;
    storeId?: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  electronica: 'Electrónica',
  ropa: 'Ropa',
  muebles: 'Muebles',
  adornos: 'Adornos',
  cocina: 'Cocina',
};

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
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CAT_ICONS: Record<string, any> = {
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
  const [updatingQty, setUpdatingQty] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setMsg('');

    try {
      const data = await api.get('/cart');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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

  const updateQuantity = async (productId: string, nextQuantity: number) => {
    try {
      setUpdatingQty(productId);
      await api.patch(`/cart/item/${productId}`, { quantity: nextQuantity });
      fetchCart();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setUpdatingQty(null);
    }
  };

  const clearCart = async () => {
    try {
      await api.del('/cart');
      setItems([]);
      setTotal(0);
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total;
  const shipping = 0;
  const finalTotal = subtotal + shipping;
  const lowStockItems = items.filter(item => (item.product?.stock || 0) <= 5).length;

  if (loading) return <div className="loading">Cargando carrito...</div>;

  return (
    <div className="page cart-premium-page">
      <div className="page-header cart-page-header">
        <div>
          <h1 className="page-title">
            Mi <span>Carrito</span>
          </h1>
          <p className="page-subtitle">
            Carrito documental gestionado en MongoDB antes de confirmar la compra.
          </p>
        </div>

        <div className="cart-kpis">
          <div>
            <strong>{items.length}</strong>
            <span>Productos</span>
          </div>
          <div>
            <strong>{totalUnits}</strong>
            <span>Unidades</span>
          </div>
          <div>
            <strong>{lowStockItems}</strong>
            <span>Stock crítico</span>
          </div>
        </div>
      </div>

      {msg && <div className="error-msg">{msg}</div>}

      {items.length === 0 ? (
        <div className="cart-empty-premium">
          <div className="cart-empty-icon">
            <IconCart />
          </div>
          <h2>Tu carrito está vacío</h2>
          <p>
            Agrega productos al carrito para continuar con el flujo de checkout,
            pago seguro y facturación automática.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Ver productos <IconArrowRight />
          </button>
        </div>
      ) : (
        <div className="cart-layout cart-layout-premium">
          <div className="cart-list cart-list-premium">
            {items.map(item => {
              const product = item.product;
              const lineTotal = (product?.price || 0) * item.quantity;
              const stock = product?.stock || 0;
              const isLowStock = stock > 0 && stock <= 5;

              return (
                <div key={item.productId} className={`cart-item-premium ${isLowStock ? 'cart-low-stock' : ''}`}>
                  <div className="cart-product-visual">
                    <div className="cart-item-icon">
                      {CAT_ICONS[product?.category || ''] || <IconBox />}
                    </div>
                    <span className="cart-db-badge">MongoDB</span>
                  </div>

                  <div className="cart-item-info cart-item-info-premium">
                    <div className="cart-item-topline">
                      <span className={`product-category-badge ${product?.category || ''}`}>
                        {CATEGORY_LABELS[product?.category || ''] || product?.category || 'Producto'}
                      </span>

                      {isLowStock ? (
                        <span className="cart-stock-pill warning">
                          <IconWarning /> Stock bajo
                        </span>
                      ) : (
                        <span className="cart-stock-pill">
                          <IconCheck /> Stock disponible
                        </span>
                      )}
                    </div>

                    <div className="cart-item-name">{product?.name || item.productId}</div>

                    <div className="cart-item-details">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={updatingQty === item.productId}
                          title="Disminuir cantidad"
                        >
                          −
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={updatingQty === item.productId || item.quantity >= stock}
                          title="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <span>Precio unitario: <strong>${(product?.price || 0).toFixed(2)}</strong></span>
                      <span>Stock actual: <strong>{stock}</strong></span>
                    </div>
                  </div>

                  <div className="cart-item-price-block">
                    <small>Subtotal</small>
                    <strong>${lineTotal.toFixed(2)}</strong>
                    <button className="btn-remove" onClick={() => removeItem(item.productId)} title="Eliminar">
                      <IconX />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary cart-summary-premium">
            <div className="cart-summary-title">Resumen del pedido</div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Envío</span>
              <span style={{ color: 'var(--success)' }}>Gratis</span>
            </div>

            <div className="cart-summary-row">
              <span>Productos</span>
              <span>{items.length}</span>
            </div>

            <div className="cart-summary-row">
              <span>Unidades</span>
              <span>{totalUnits}</span>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            <div className="cart-mongo-note">
              <IconDatabase />
              <p>
                Este carrito se gestiona como documento flexible en MongoDB.
                Al confirmar la compra, la orden, pago y factura pasan a PostgreSQL.
              </p>
            </div>

            <div className="cart-secure-note">
              <IconShield />
              <span>Checkout protegido con validación de stock y facturación automática.</span>
            </div>

            <div className="cart-actions">
              <button className="btn-primary btn-large" onClick={() => navigate('/checkout')}>
                Proceder al pago <IconArrowRight />
              </button>
              <button className="cart-clear-btn" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}