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

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconCreditCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconBank = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h18"/>
    <path d="M5 10v8"/>
    <path d="M9 10v8"/>
    <path d="M15 10v8"/>
    <path d="M19 10v8"/>
    <path d="M4 18h16"/>
    <path d="M2 22h20"/>
    <path d="M12 2l9 6H3l9-6z"/>
  </svg>
);

const BOLIVIA_DEPARTMENTS = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
];

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function onlyLetters(value: string) {
  return value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
}

function cleanBusinessName(value: string) {
  return value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s.&-]/g, '');
}

function formatCardNumber(value: string) {
  const numbers = onlyNumbers(value).slice(0, 16);
  return numbers.replace(/(.{4})/g, '$1 ').trim();
}

const PAYMENT_OPTIONS = [
  {
    value: 'CASH_ON_DELIVERY',
    title: 'Pago contra entrega',
    desc: 'Paga cuando recibas el pedido.',
    icon: <IconTruck />,
  },
  {
    value: 'CREDIT_CARD',
    title: 'Tarjeta de crédito',
    desc: 'Se registra un token cifrado seguro.',
    icon: <IconCreditCard />,
  },
  {
    value: 'DEBIT_CARD',
    title: 'Tarjeta de débito',
    desc: 'Solo se guardan los últimos 4 dígitos.',
    icon: <IconCreditCard />,
  },
  {
    value: 'BANK_TRANSFER',
    title: 'Transferencia bancaria',
    desc: 'El pago queda pendiente de validación.',
    icon: <IconBank />,
  },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState<any[]>([]);
  const [form, setForm] = useState({
    storeId: '',
    address: '',
    city: 'La Paz',
    notes: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    cardNumber: '',
    cardHolder: '',
    nit: '',
    businessName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCardPayment = form.paymentMethod === 'CREDIT_CARD' || form.paymentMethod === 'DEBIT_CARD';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.get('/orders/stores')
      .then(data => {
        setStores(data);
        if (data.length > 0) {
          setForm(f => ({ ...f, storeId: String(data[0].id) }));
        }
      })
      .catch((err) => setError(err.message));
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.storeId) {
      setError('Debe seleccionar una tienda.');
      return;
    }

    if (!form.address.trim()) {
      setError('Debe ingresar una dirección de entrega.');
      return;
    }

    if (!form.city.trim()) {
      setError('Debe seleccionar un departamento.');
      return;
    }

    if (isCardPayment) {
      const cleanCard = onlyNumbers(form.cardNumber);

      if (cleanCard.length < 12 || cleanCard.length > 16) {
        setError('El número de tarjeta debe tener entre 12 y 16 dígitos.');
        return;
      }

      if (!form.cardHolder.trim()) {
        setError('Debe ingresar el nombre del titular de la tarjeta.');
        return;
      }
    }

    if (form.nit && onlyNumbers(form.nit).length < 5) {
      setError('El NIT/CI debe tener al menos 5 dígitos.');
      return;
    }

    if (form.businessName && form.businessName.trim().length < 3) {
      setError('La razón social o nombre debe tener al menos 3 caracteres.');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        storeId: form.storeId,
        address: form.address,
        city: form.city,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        cardNumber: isCardPayment ? onlyNumbers(form.cardNumber) : undefined,
        nit: form.nit ? onlyNumbers(form.nit) : '0',
        businessName: form.businessName.trim() || undefined,
      };

      const order = await api.post('/orders', payload);
      navigate(`/orders?success=${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPayment = PAYMENT_OPTIONS.find(option => option.value === form.paymentMethod);

  return (
    <div className="page">
      <div className="page-header checkout-page-header">
        <div>
          <h1 className="page-title">Finalizar <span>Compra</span></h1>
          <p className="page-subtitle">
            Completa la entrega, pago y datos de facturación.
          </p>
        </div>

        <div className="checkout-security-badge">
          <IconShield />
          <div>
            <strong>Checkout seguro</strong>
            <span>Orden + pago + factura en PostgreSQL</span>
          </div>
        </div>
      </div>

      <div className="checkout-container checkout-premium">
        <div className="checkout-form">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="checkout-section">
              <div className="checkout-section-title">
                <span>1</span>
                <div>
                  <h3>Tienda</h3>
                  <p>Selecciona la tienda que procesará el pedido.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Tienda</label>
                <select
                  value={form.storeId}
                  onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar tienda...</option>
                  {stores.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </section>

            <section className="checkout-section">
              <div className="checkout-section-title">
                <span>2</span>
                <div>
                  <h3>Dirección de entrega</h3>
                  <p>Usaremos esta información para la entrega y auditoría del checkout.</p>
                </div>
              </div>

              <div className="checkout-two-cols">
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    required
                    placeholder="Calle, número, piso..."
                  />
                </div>

                <div className="form-group">
                  <label>Departamento</label>
                  <select
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    required
                  >
                    {BOLIVIA_DEPARTMENTS.map(department => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notas adicionales <small style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</small></label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Instrucciones especiales..."
                />
              </div>
            </section>

            <section className="checkout-section">
              <div className="checkout-section-title">
                <span>3</span>
                <div>
                  <h3>Método de pago</h3>
                  <p>El pago queda asociado a la orden y a la factura.</p>
                </div>
              </div>

              <div className="payment-options">
                {PAYMENT_OPTIONS.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    className={`payment-option ${form.paymentMethod === option.value ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, paymentMethod: option.value }))}
                  >
                    <div className="payment-option-icon">{option.icon}</div>
                    <div>
                      <strong>{option.title}</strong>
                      <span>{option.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {isCardPayment && (
                <div className="card-payment-box">
                  <div className="security-note">
                    <IconShield />
                    <p>
                      No almacenamos el número completo de tarjeta. El backend guarda solo los últimos 4 dígitos
                      y genera un token cifrado para trazabilidad segura.
                    </p>
                  </div>

                  <div className="checkout-two-cols">
                    <div className="form-group">
                      <label>Número de tarjeta</label>
                      <input
                        value={form.cardNumber}
                        onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                        required={isCardPayment}
                        placeholder="4111 1111 1111 1111"
                        inputMode="numeric"
                        maxLength={19}
                      />
                    </div>

                    <div className="form-group">
                      <label>Titular</label>
                      <input
                        value={form.cardHolder}
                        onChange={e => setForm(f => ({ ...f, cardHolder: onlyLetters(e.target.value) }))}
                        required={isCardPayment}
                        placeholder="Nombre en la tarjeta"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="checkout-section">
              <div className="checkout-section-title">
                <span>4</span>
                <div>
                  <h3>Datos de facturación</h3>
                  <p>Se generará una factura automáticamente al confirmar la orden.</p>
                </div>
              </div>

              <div className="checkout-two-cols">
                <div className="form-group">
                  <label>NIT/CI</label>
                  <input
                    value={form.nit}
                    onChange={e => setForm(f => ({ ...f, nit: onlyNumbers(e.target.value).slice(0, 15) }))}
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>

                <div className="form-group">
                  <label>Razón social / Nombre</label>
                  <input
                    value={form.businessName}
                    onChange={e => setForm(f => ({ ...f, businessName: cleanBusinessName(e.target.value) }))}
                    placeholder="Consumidor final"
                  />
                </div>
              </div>
            </section>

            <button type="submit" className="btn-primary btn-large checkout-submit" disabled={loading || stores.length === 0}>
              {loading ? 'Procesando orden...' : <><IconCheck /> Confirmar pedido <IconArrowRight /></>}
            </button>
          </form>
        </div>

        <aside className="checkout-side-panel">
          <h3>Resumen del checkout</h3>

          <div className="checkout-summary-line">
            <span>Tienda</span>
            <strong>{stores.find(s => String(s.id) === form.storeId)?.name || 'Pendiente'}</strong>
          </div>

          <div className="checkout-summary-line">
            <span>Entrega</span>
            <strong>{form.city || 'Sin ciudad'}</strong>
          </div>

          <div className="checkout-summary-line">
            <span>Pago</span>
            <strong>{selectedPayment?.title || 'Pendiente'}</strong>
          </div>

          <div className="checkout-summary-line">
            <span>Factura</span>
            <strong>{form.businessName || user?.firstName || 'Consumidor final'}</strong>
          </div>

          <div className="checkout-architecture-note">
            <IconShield />
            <p>
              Al confirmar, la API crea orden, pago y factura en PostgreSQL, descuenta stock en MongoDB
              y registra auditoría documental.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}