import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IconDollar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21 5,3"/>
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
  </svg>
);

const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
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

const IconSpark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/>
    <path d="M19 15l.8 2.7L22 18.5l-2.2.8L19 22l-.8-2.7-2.2-.8 2.2-.8L19 15z"/>
  </svg>
);

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeReport, setActiveReport] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [params, setParams] = useState({
    minPrice: '100',
    maxPrice: '1000',
    threshold: '5',
    tags: 'oferta,nuevo',
    brands: '',
    category: '',
    color: 'gris',
    size: 'M',
    premiumPrice: '500',
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STORE_MANAGER')) {
    navigate('/');
    return null;
  }

  const normalizeResults = (data: any) => {
    if (Array.isArray(data)) return { rows: data, meta: null };
    if (Array.isArray(data.products)) return { rows: data.products, meta: data };
    return { rows: [data], meta: data };
  };

  const runReport = async (endpoint: string, reportId: string) => {
    setLoading(true);
    setError('');
    setActiveReport(reportId);
    setResults([]);
    setMeta(null);

    try {
      const data = await api.get(endpoint);
      const normalized = normalizeResults(data);
      setResults(normalized.rows);
      setMeta(normalized.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      id: 'expensive',
      icon: <IconDollar />,
      title: 'Productos por rango de precio',
      desc: <>MongoDB con <code>$gt</code>, <code>$lt</code> y <code>$and</code>.</>,
      content: (
        <div className="report-params">
          <input placeholder="Min $" value={params.minPrice} onChange={e => setParams(p => ({ ...p, minPrice: e.target.value }))} type="number" />
          <input placeholder="Max $" value={params.maxPrice} onChange={e => setParams(p => ({ ...p, maxPrice: e.target.value }))} type="number" />
          <input placeholder="Categoría opcional" value={params.category} onChange={e => setParams(p => ({ ...p, category: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/expensive?minPrice=${params.minPrice}&maxPrice=${params.maxPrice}&category=${params.category}`, 'expensive'),
    },
    {
      id: 'tags',
      icon: <IconTag />,
      title: 'Búsqueda por tags o marcas',
      desc: <>Consulta arreglos con <code>$in</code> y combina filtros con <code>$or</code>.</>,
      content: (
        <div className="report-params">
          <input placeholder="Tags: oferta,nuevo" value={params.tags} onChange={e => setParams(p => ({ ...p, tags: e.target.value }))} />
          <input placeholder="Marcas: Lenovo,Samsung" value={params.brands} onChange={e => setParams(p => ({ ...p, brands: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/by-tags?tags=${params.tags}&brands=${params.brands}`, 'tags'),
    },
    {
      id: 'lowstock',
      icon: <IconWarning />,
      title: 'Productos bajo stock',
      desc: <>Inventario crítico usando <code>$lt</code>.</>,
      content: (
        <div className="report-params">
          <input placeholder="Umbral" value={params.threshold} onChange={e => setParams(p => ({ ...p, threshold: e.target.value }))} type="number" />
        </div>
      ),
      run: () => runReport(`/reports/products/low-stock?threshold=${params.threshold}`, 'lowstock'),
    },
    {
      id: 'dynamic',
      icon: <IconDatabase />,
      title: 'Atributos dinámicos BSON',
      desc: <>Muestra campos distintos por categoría sin cambiar tablas SQL.</>,
      content: (
        <div className="report-params">
          <input placeholder="Categoría opcional" value={params.category} onChange={e => setParams(p => ({ ...p, category: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/dynamic-attributes?category=${params.category}`, 'dynamic'),
    },
    {
      id: 'variants',
      icon: <IconLayers />,
      title: 'Consulta por variantes',
      desc: <>Busca dentro de arreglos con dot notation: <code>variants.color</code>.</>,
      content: (
        <div className="report-params">
          <input placeholder="Color" value={params.color} onChange={e => setParams(p => ({ ...p, color: e.target.value }))} />
          <input placeholder="Talla" value={params.size} onChange={e => setParams(p => ({ ...p, size: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/variants?color=${params.color}&size=${params.size}`, 'variants'),
    },
    {
      id: 'category-summary',
      icon: <IconBarChart />,
      title: 'Resumen por categoría',
      desc: <>Aggregation pipeline con <code>$group</code>, <code>$avg</code> y <code>$sum</code>.</>,
      content: null,
      run: () => runReport('/reports/products/category-summary', 'category-summary'),
    },
    {
      id: 'premium',
      icon: <IconSpark />,
      title: 'Premium o stock crítico',
      desc: <>Consulta comparativa con <code>$or</code>, <code>$gt</code> y <code>$lt</code>.</>,
      content: (
        <div className="report-params">
          <input placeholder="Precio premium" value={params.premiumPrice} onChange={e => setParams(p => ({ ...p, premiumPrice: e.target.value }))} type="number" />
          <input placeholder="Stock crítico" value={params.threshold} onChange={e => setParams(p => ({ ...p, threshold: e.target.value }))} type="number" />
        </div>
      ),
      run: () => runReport(`/reports/products/premium-or-low-stock?minPrice=${params.premiumPrice}&threshold=${params.threshold}`, 'premium'),
    },
    ...(user.role === 'ADMIN' ? [
      {
        id: 'sales',
        icon: <IconBarChart />,
        title: 'Ventas por tienda',
        desc: <>Agrupación transaccional en PostgreSQL.</>,
        content: null,
        run: () => runReport('/reports/sales', 'sales'),
      },
      {
        id: 'invoices',
        icon: <IconReceipt />,
        title: 'Resumen de facturación',
        desc: <>Facturas, pagos y órdenes desde PostgreSQL.</>,
        content: null,
        run: () => runReport('/reports/invoices/summary', 'invoices'),
      },
    ] : []),
  ];

  const visibleColumns = results.length > 0
    ? Object.keys(results[0]).filter(k => !['_id', 'productId'].includes(k)).slice(0, 9)
    : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span>Reportes</span> Avanzados</h1>
        <p className="page-subtitle">
          Consultas MongoDB + PostgreSQL para demostrar persistencia políglota.
        </p>
      </div>

      <div className="reports-grid">
        {reports.map(r => (
          <div key={r.id} className={`report-card ${activeReport === r.id ? 'active' : ''}`}>
            <div className="report-card-header">
              <div className="report-card-icon">{r.icon}</div>
              <h3>{r.title}</h3>
            </div>
            <p>{r.desc}</p>
            {r.content}
            <button className="btn-primary" onClick={r.run} disabled={loading && activeReport === r.id}>
              <IconPlay /> Ejecutar
            </button>
          </div>
        ))}
      </div>

      {loading && <div className="loading">Ejecutando reporte...</div>}
      {error && <div className="error-msg">{error}</div>}

      {meta && (
        <div className="report-results">
          <h3>{meta.report || 'Reporte ejecutado'}</h3>

          <div className="report-summary">
            <div className="summary-card">
              <strong>Base de datos</strong>
              <span>{meta.database || 'N/A'}</span>
            </div>
            <div className="summary-card">
              <strong>Resultados</strong>
              <span>{meta.count ?? results.length}</span>
            </div>
            <div className="summary-card">
              <strong>Operadores</strong>
              <span>{Array.isArray(meta.operators) ? meta.operators.join(', ') : 'Consulta integrada'}</span>
            </div>
          </div>

          {meta.objective && (
            <p className="report-objective">{meta.objective}</p>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="report-results">
          <h3>Resultados ({results.length})</h3>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  {visibleColumns.map(k => (
                    <th key={k}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {visibleColumns.map(k => {
                      const value = row[k];
                      return (
                        <td key={k}>
                          {typeof value === 'object' && value !== null
                            ? JSON.stringify(value).slice(0, 80)
                            : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.length > 20 && (
            <p className="page-subtitle">Mostrando los primeros 20 resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}