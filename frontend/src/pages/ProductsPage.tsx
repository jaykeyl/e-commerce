import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  storeId: string;
  tags: string[];
  brand?: string;
  imageUrl?: string;

  variants?: Record<string, any>[];
  sizes?: string[];
  colors?: string[];

  voltage?: string;
  warrantyMonths?: number;
  connectivity?: string[];
  material?: string;
  dimensions?: Record<string, any>;
  capacity?: string;
  dishwasherSafe?: boolean;
  ovenSafe?: boolean;
  theme?: string;
  style?: string;

  [key: string]: any;
}

const CATEGORIES = ['todas', 'electronica', 'ropa', 'muebles', 'adornos', 'cocina'];

const CATEGORY_LABELS: Record<string, string> = {
  todas: 'Todas',
  electronica: 'Electrónica',
  ropa: 'Ropa',
  muebles: 'Muebles',
  adornos: 'Adornos',
  cocina: 'Cocina',
};

const STORE_LABELS: Record<string, string> = {
  'tech-zone': 'Tech Zone',
  'moda-urbana': 'Moda Urbana',
  'casa-bella': 'Casa Bella',
};

function getDynamicAttributes(product: Product) {
  const ignored = [
    '_id',
    'name',
    'category',
    'price',
    'stock',
    'storeId',
    'tags',
    'brand',
    'imageUrl',
    'createdAt',
    'updatedAt',
  ];

  return Object.entries(product)
    .filter(([key, value]) => {
      if (ignored.includes(key)) return false;
      if (value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
      return true;
    })
    .slice(0, 4);
}

function formatDynamicValue(value: any) {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'object') return Object.values(item).join(' / ');
        return String(item);
      })
      .slice(0, 2)
      .join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 2)
      .join(', ');
  }

  return String(value);
}

function formatAttributeName(key: string) {
  const labels: Record<string, string> = {
    variants: 'Variantes',
    sizes: 'Tallas',
    colors: 'Colores',
    voltage: 'Voltaje',
    warrantyMonths: 'Garantía',
    connectivity: 'Conectividad',
    material: 'Material',
    dimensions: 'Dimensiones',
    capacity: 'Capacidad',
    dishwasherSafe: 'Lavavajillas',
    ovenSafe: 'Horno',
    theme: 'Tema',
    style: 'Estilo',
  };

  return labels[key] || key;
}

function getDynamicSummary(product: Product) {
  const attributes = getDynamicAttributes(product);

  if (attributes.length === 0) {
    return 'Este producto no tiene atributos dinámicos adicionales.';
  }

  return attributes
    .map(([key, value]) => `${formatAttributeName(key)}: ${formatDynamicValue(value)}`)
    .join(' • ');
}

// ── SVG Icons ──────────────────────────────────────────────────
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const IconEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// Category placeholder icons
const CatIcons: Record<string, JSX.Element> = {
  electronica: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  ropa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  muebles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/>
      <line x1="6" y1="18" x2="6" y2="22"/><line x1="18" y1="18" x2="18" y2="22"/>
    </svg>
  ),
  adornos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  cocina: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 13s.5-6 5-6 5 6 5 6"/>
    </svg>
  ),
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'todas',
    minPrice: '',
    maxPrice: '',
    search: '',
    inStock: false,
  });
  const [cartMsg, setCartMsg] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('multistore_favorites');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const fetchProductsWithFilters = async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (nextFilters.category !== 'todas') params.set('category', nextFilters.category);
      if (nextFilters.minPrice) params.set('minPrice', nextFilters.minPrice);
      if (nextFilters.maxPrice) params.set('maxPrice', nextFilters.maxPrice);
      if (nextFilters.search) params.set('search', nextFilters.search);
      if (nextFilters.inStock) params.set('inStock', 'true');

      const data = await api.get(`/products?${params}`);
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsWithFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = async (productId: string) => {
    if (!user) {
      setCartMsg('Debes iniciar sesión para agregar al carrito');
      return;
    }

    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      setCartMsg('Agregado al carrito');
      setTimeout(() => setCartMsg(''), 2500);
    } catch (err: any) {
      setCartMsg('Error: ' + err.message);
    }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);

      try {
        localStorage.setItem('multistore_favorites', JSON.stringify(Array.from(next)));
      } catch {
        // Si localStorage no está disponible, igual funciona en memoria.
      }

      return next;
    });
  };

  const getBtnClass = (cat: string) => {
    const map: Record<string, string> = {
      ropa: 'ropa-cat',
      muebles: 'muebles-cat',
      adornos: 'adornos-cat',
      cocina: 'cocina-cat',
    };

    return `btn-cart ${map[cat] || 'primary-cat'}`;
  };

  const clearFilters = () => {
    const cleanFilters = {
      category: 'todas',
      minPrice: '',
      maxPrice: '',
      search: '',
      inStock: false,
    };

    setFilters(cleanFilters);
    fetchProductsWithFilters(cleanFilters);
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div className="page">
      <div className="page-header products-page-header">
        <div>
          <h1 className="page-title">
            Encuentra lo que <span>necesitas hoy</span>{' '}
            <span className="sparkle"><IconSparkle /></span>
          </h1>
          <p className="page-subtitle">
            Catálogo flexible en MongoDB con atributos dinámicos por categoría.
          </p>
        </div>

        <div className="products-kpis">
          <div>
            <strong>{totalProducts}</strong>
            <span>Productos</span>
          </div>
          <div>
            <strong>{categoriesCount}</strong>
            <span>Categorías</span>
          </div>
          <div>
            <strong>{lowStockCount}</strong>
            <span>Stock bajo</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-top">
          <div className="search-bar-wrapper">
            <span className="search-bar-icon"><IconSearch /></span>
            <input
              className="search-input"
              placeholder="Buscar productos, marcas, tags..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && fetchProductsWithFilters()}
            />
          </div>

          <button className="filter-settings-btn" title="Filtros avanzados" onClick={() => setShowFilters(s => !s)}>
            <IconFilter />
          </button>
        </div>

        <div className="categories-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${filters.category === cat ? 'active' : ''}`}
              onClick={() => {
                const nextFilters = { ...filters, category: cat };
                setFilters(nextFilters);
                fetchProductsWithFilters(nextFilters);
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="price-filters">
            <div className="price-filter-group">
              <label>Precio mínimo</label>
              <div className="price-symbol">
                <span className="price-symbol-label">$</span>
                <input
                  placeholder="0"
                  type="number"
                  value={filters.minPrice}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                  className="price-input"
                />
              </div>
            </div>

            <span className="price-divider">—</span>

            <div className="price-filter-group">
              <label>Precio máximo</label>
              <div className="price-symbol">
                <span className="price-symbol-label">$</span>
                <input
                  placeholder="∞"
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="price-input"
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))}
              />
              Solo en stock
            </label>

            <button className="btn-primary" onClick={() => fetchProductsWithFilters()}>
              <IconSearch /> Buscar
            </button>

            <button className="btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {cartMsg && (
        <div className="cart-toast">
          <span className="toast-check"><IconCheck /></span>
          {cartMsg}
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <div className="products-grid">
          {products.map(p => {
            const dynamicAttributes = getDynamicAttributes(p);
            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutStock = p.stock === 0;

            return (
              <div key={p._id} className={`product-card product-card-premium ${isLowStock ? 'low-stock-card' : ''}`}>
                <div className="product-card-img product-card-img-premium">
                  {p.imageUrl && !failedImages.has(p._id) ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="product-real-img"
                      loading="lazy"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(p._id));
                      }}
                    />
                  ) : (
                    <div className="product-img-placeholder product-img-fallback">
                      {CatIcons[p.category] || CatIcons.default}
                    </div>
                  )}

                  <div className="product-floating-badges">
                    <span className="mongo-badge">BSON</span>
                    {isLowStock && <span className="stock-alert-badge">Stock bajo</span>}
                    {isOutStock && <span className="stock-alert-badge danger">Sin stock</span>}
                  </div>

                  {dynamicAttributes.length > 0 && (
                    <button
                      className="product-info-btn product-info-tooltip-btn"
                      type="button"
                      aria-label="Ver atributos dinámicos"
                      data-tooltip={getDynamicSummary(p)}
                      title={getDynamicSummary(p)}
                    >
                      <IconInfo />
                    </button>
                  )}
                </div>

                <div className="product-card-body">
                  <div className="product-card-top">
                    <span className={`product-category-badge ${p.category}`}>
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>

                    <button
                      className={`product-heart ${liked.has(p._id) ? 'liked' : ''}`}
                      onClick={() => toggleLike(p._id)}
                      title="Favorito"
                    >
                      <IconHeart filled={liked.has(p._id)} />
                    </button>
                  </div>

                  <div className="product-name">{p.name}</div>

                  <div className="product-meta-row">
                    {p.brand && <span>{p.brand}</span>}
                    <span>{STORE_LABELS[p.storeId] || p.storeId}</span>
                  </div>

                  <div className="product-price-row">
                    <div className="product-price">${p.price.toFixed(2)}</div>

                    <div className={`product-stock ${isOutStock ? 'out' : isLowStock ? 'low' : 'ok'}`}>
                      {isOutStock
                        ? <><IconX /> Sin stock</>
                        : isLowStock
                          ? <><IconWarning /> Solo {p.stock}</>
                          : <><IconCheck /> {p.stock} unidades</>
                      }
                    </div>
                  </div>

                  {p.tags?.length > 0 && (
                    <div className="product-tags product-tags-premium">
                      {p.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="product-store product-store-premium">
                    <IconStore /> Catálogo documental · {STORE_LABELS[p.storeId] || p.storeId}
                  </div>

                  <button
                    className={getBtnClass(p.category)}
                    disabled={isOutStock}
                    onClick={() => addToCart(p._id)}
                  >
                    <IconCart /> {isOutStock ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="empty">
          <div className="empty-icon"><IconEmpty /></div>
          <p>No se encontraron productos con esos filtros.</p>
          <button className="btn-primary" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

    </div>
  );
}
