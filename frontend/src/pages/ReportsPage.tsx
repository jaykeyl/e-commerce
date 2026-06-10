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

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [params, setParams] = useState({ minPrice: '100', maxPrice: '1000', threshold: '5', tags: 'oferta,nuevo', category: '' });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STORE_MANAGER')) {
    navigate('/'); return null;
  }

  const runReport = async (endpoint: string, reportId: string) => {
    setLoading(true); setError(''); setActiveReport(reportId);
    try {
      const data = await api.get(endpoint);
      setResults(Array.isArray(data) ? data : data.products || data);
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
      desc: <>Usa operadores <code>$gt</code>, <code>$lt</code>, <code>$and</code> en MongoDB</>,
      content: (
        <div className="report-params">
          <input placeholder="Min $" value={params.minPrice} onChange={e => setParams(p => ({ ...p, minPrice: e.target.value }))} type="number" />
          <input placeholder="Max $" value={params.maxPrice} onChange={e => setParams(p => ({ ...p, maxPrice: e.target.value }))} type="number" />
          <input placeholder="Categoría (opcional)" value={params.category} onChange={e => setParams(p => ({ ...p, category: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/expensive?minPrice=${params.minPrice}&maxPrice=${params.maxPrice}&category=${params.category}`, 'expensive'),
    },
    {
      id: 'tags',
      icon: <IconTag />,
      title: 'Buscar por tags / marcas',
      desc: <>Usa operadores <code>$in</code>, <code>$or</code> en arrays de MongoDB</>,
      content: (
        <div className="report-params">
          <input placeholder="Tags (coma: oferta,nuevo)" value={params.tags} onChange={e => setParams(p => ({ ...p, tags: e.target.value }))} />
        </div>
      ),
      run: () => runReport(`/reports/products/by-tags?tags=${params.tags}`, 'tags'),
    },
    {
      id: 'lowstock',
      icon: <IconWarning />,
      title: 'Productos bajo stock',
      desc: <>Usa <code>$lt</code> para filtrar stock bajo umbral</>,
      content: (
        <div className="report-params">
          <input placeholder="Umbral" value={params.threshold} onChange={e => setParams(p => ({ ...p, threshold: e.target.value }))} type="number" />
        </div>
      ),
      run: () => runReport(`/reports/products/low-stock?threshold=${params.threshold}`, 'lowstock'),
    },
    ...(user.role === 'ADMIN' ? [{
      id: 'sales',
      icon: <IconBarChart />,
      title: 'Ventas por tienda',
      desc: <>Agrupación en PostgreSQL por tienda y estado de orden</>,
      content: null,
      run: () => runReport('/reports/sales', 'sales'),
    }] : []),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span>Reportes</span> Admin</h1>
        <p className="page-subtitle">Consultas avanzadas en tiempo real</p>
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

      {results.length > 0 && (
        <div className="report-results">
          <h3>Resultados ({results.length})</h3>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  {Object.keys(results[0]).filter(k => !['_id'].includes(k)).slice(0, 8).map(k => (
                    <th key={k}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row).filter(([k]) => k !== '_id').slice(0, 8).map(([k, v]) => (
                      <td key={k}>{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
