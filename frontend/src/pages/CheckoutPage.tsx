import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<any[]>([]);
  const [form, setForm] = useState({ storeId: '', address: '', city: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/stores')
      .then(data => {
        setStores(data);
        if (data.length > 0) {
          setForm(f => ({ ...f, storeId: String(data[0].id) }));
        }
      })
      .catch((err) => setError(err.message));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const order = await api.post('/orders', form);
      navigate(`/orders?success=${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Finalizar <span>Compra</span></h1>
        <p className="page-subtitle">Completa tu pedido</p>
      </div>

      <div className="checkout-container">
        <div className="checkout-form">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <h3>Tienda</h3>
            <div className="form-group">
              <label>Tienda</label>
              <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} required>
                <option value="">Seleccionar tienda...</option>
                {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <h3>Dirección de entrega</h3>
            <div className="form-group">
              <label>Dirección</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required placeholder="Calle, número, piso..." />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required placeholder="La Paz" />
            </div>

            <h3>Notas</h3>
            <div className="form-group">
              <label>Notas adicionales <small style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</small></label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Instrucciones especiales..." />
            </div>

            <button type="submit" className="btn-primary btn-large" disabled={loading || stores.length === 0}>
              {loading ? 'Procesando...' : <><IconCheck /> Confirmar pedido <IconArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
