import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface DashboardState {
  sales: any;
  invoices: any;
  lowStock: any;
  categories: any;
}

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
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

const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

function extractArray(data: any, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data)) return data;

  return [];
}

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardState>({
    sales: null,
    invoices: null,
    lowStock: null,
    categories: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [sales, invoices, lowStock, categories] = await Promise.allSettled([
        api.get('/reports/sales'),
        api.get('/reports/invoices/summary'),
        api.get('/reports/products/low-stock'),
        api.get('/reports/products/category-summary'),
      ]);

      setData({
        sales: sales.status === 'fulfilled' ? sales.value : null,
        invoices: invoices.status === 'fulfilled' ? invoices.value : null,
        lowStock: lowStock.status === 'fulfilled' ? lowStock.value : null,
        categories: categories.status === 'fulfilled' ? categories.value : null,
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = useMemo(() => {
    const salesRows = extractArray(data.sales, ['sales', 'data', 'results', 'stores']);
    const invoiceRows = extractArray(data.invoices, ['invoices', 'data', 'results']);
    const lowStockRows = extractArray(data.lowStock, ['products', 'data', 'results']);
    const categoryRows = extractArray(data.categories, ['categories', 'data', 'results', 'summary']);

    const totalSales = salesRows.reduce((sum: number, row: any) => {
      return sum + Number(row.total || row.totalSales || row.revenue || row._sum?.totalAmount || 0);
    }, 0);

    const totalInvoices = invoiceRows.length;
    const totalLowStock = lowStockRows.length;
    const totalCategories = categoryRows.length;

    return {
      salesRows,
      invoiceRows,
      lowStockRows,
      categoryRows,
      totalSales,
      totalInvoices,
      totalLowStock,
      totalCategories,
    };
  }, [data]);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Panel ejecutivo</span>
          <h1>
            Dashboard <span>MultiStore</span>
          </h1>
          <p>
            Vista general del e-commerce multitienda usando PostgreSQL para datos
            transaccionales y MongoDB para catálogo, carrito y auditoría documental.
          </p>
        </div>

        <div className="dashboard-hero-card">
          <IconShield />
          <strong>Arquitectura híbrida activa</strong>
          <span>SQL + NoSQL trabajando en el flujo completo de compra.</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon sales">
            <IconChart />
          </div>
          <div>
            <span>Ventas registradas</span>
            <strong>{money(metrics.totalSales)}</strong>
            <small>PostgreSQL</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon invoices">
            <IconReceipt />
          </div>
          <div>
            <span>Facturas emitidas</span>
            <strong>{metrics.totalInvoices}</strong>
            <small>Facturación relacional</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon warning">
            <IconWarning />
          </div>
          <div>
            <span>Stock bajo</span>
            <strong>{metrics.totalLowStock}</strong>
            <small>Consulta MongoDB</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon database">
            <IconDatabase />
          </div>
          <div>
            <span>Categorías dinámicas</span>
            <strong>{metrics.totalCategories}</strong>
            <small>BSON flexible</small>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Estado de inventario</h2>
              <p>Productos detectados con stock bajo desde MongoDB.</p>
            </div>
            <button className="dashboard-link-btn" onClick={() => navigate('/reports')}>
              Ver reportes <IconArrowRight />
            </button>
          </div>

          {metrics.lowStockRows.length === 0 ? (
            <div className="dashboard-empty-mini">
              No hay productos con stock bajo en este momento.
            </div>
          ) : (
            <div className="dashboard-list">
              {metrics.lowStockRows.slice(0, 5).map((product: any, index: number) => (
                <div key={product._id || product.id || index} className="dashboard-list-item">
                  <div>
                    <strong>{product.name || product.productName || 'Producto'}</strong>
                    <span>{product.category || 'categoría'} · stock {product.stock ?? '-'}</span>
                  </div>
                  <span className="dashboard-pill warning">Stock bajo</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Facturación reciente</h2>
              <p>Facturas emitidas desde PostgreSQL.</p>
            </div>
            <button className="dashboard-link-btn" onClick={() => navigate('/orders')}>
              Ver pedidos <IconArrowRight />
            </button>
          </div>

          {metrics.invoiceRows.length === 0 ? (
            <div className="dashboard-empty-mini">
              Todavía no hay facturas recientes.
            </div>
          ) : (
            <div className="dashboard-list">
              {metrics.invoiceRows.slice(0, 5).map((invoice: any, index: number) => (
                <div key={invoice.id || invoice.invoiceNumber || index} className="dashboard-list-item">
                  <div>
                    <strong>{invoice.invoiceNumber || invoice.number || 'Factura'}</strong>
                    <span>{invoice.businessName || invoice.customer || 'Cliente'} · {money(invoice.totalAmount || invoice.total)}</span>
                  </div>
                  <span className="dashboard-pill success">Emitida</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel dashboard-architecture-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Persistencia políglota</h2>
              <p>Separación de responsabilidades por motor de base de datos.</p>
            </div>
          </div>

          <div className="dashboard-db-flow">
            <div className="dashboard-db-card postgres">
              <IconDatabase />
              <strong>PostgreSQL</strong>
              <span>Usuarios, roles, órdenes, pagos y facturas con transacciones ACID.</span>
            </div>

            <div className="dashboard-db-card mongo">
              <IconDatabase />
              <strong>MongoDB</strong>
              <span>Catálogo dinámico, carritos, variantes, tags y auditoría documental.</span>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Accesos rápidos</h2>
              <p>Rutas principales para la demo del sistema.</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <button onClick={() => navigate('/')}>Catálogo</button>
            <button onClick={() => navigate('/cart')}>Carrito</button>
            <button onClick={() => navigate('/architecture')}>Arquitectura</button>
            <button onClick={() => navigate('/reports')}>Reportes</button>
          </div>
        </section>
      </div>
    </div>
  );
}