import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  storeId: string;
  tags: string[];
  brand?: string;
  imageUrl?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
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

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7.5-4.7-9.7-9.1C.4 8.2 2.4 4 6.5 4c2 0 3.6 1 4.5 2.3C11.9 5 13.5 4 15.5 4c4.1 0 6.1 4.2 4.2 7.9C19.5 16.3 12 21 12 21z"/>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);

export default function FavoritesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('multistore_favorites');
      setFavoriteIds(new Set(saved ? JSON.parse(saved) : []));
    } catch {
      setFavoriteIds(new Set());
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      setProducts(data.products || []);
      loadFavorites();
    } catch (err: any) {
      setMsg(err.message || 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const onStorage = () => loadFavorites();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const favoriteProducts = products.filter(product => favoriteIds.has(product._id));

  const removeFavorite = (productId: string) => {
    const next = new Set(favoriteIds);
    next.delete(productId);
    setFavoriteIds(next);
    localStorage.setItem('multistore_favorites', JSON.stringify(Array.from(next)));
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      setMsg('Debes iniciar sesión para agregar al carrito.');
      return;
    }

    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      setMsg('Producto agregado al carrito.');
      setTimeout(() => setMsg(''), 2200);
    } catch (err: any) {
      setMsg(err.message || 'No se pudo agregar al carrito');
    }
  };

  if (loading) return <div className="loading">Cargando favoritos...</div>;

  return (
    <div className="page favorites-page">
      <div className="page-header favorites-header">
        <div>
          <h1 className="page-title">Mis <span>Favoritos</span></h1>
          <p className="page-subtitle">
            Productos guardados localmente para volver a ellos antes de comprar.
          </p>
        </div>

        <div className="cart-kpis">
          <div>
            <strong>{favoriteProducts.length}</strong>
            <span>Favoritos</span>
          </div>
          <div>
            <strong>{favoriteProducts.filter(p => p.tags?.includes('oferta')).length}</strong>
            <span>Ofertas</span>
          </div>
        </div>
      </div>

      {msg && <div className="error-msg">{msg}</div>}

      {favoriteProducts.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon"><IconEmpty /></div>
          <h2>Aún no guardaste favoritos</h2>
          <p>Marca productos con el corazón y aparecerán aquí automáticamente.</p>
          <a className="btn-primary" href="/">Ver productos</a>
        </div>
      ) : (
        <div className="favorites-grid">
          {favoriteProducts.map(product => {
            const isOffer = product.tags?.includes('oferta') || Boolean(product.discountPercent);
            const originalPrice = product.originalPrice || (isOffer ? product.price * 2 : undefined);
            const discountPercent = product.discountPercent || 50;

            return (
              <div className="favorite-card" key={product._id}>
                <div className="favorite-img">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="favorite-img-fallback"><IconEmpty /></div>
                  )}
                  <span className="mongo-badge">BSON</span>
                  {isOffer && <span className="offer-badge-card">{discountPercent}% OFF</span>}
                </div>

                <div className="favorite-body">
                  <span className={`product-category-badge ${product.category}`}>
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                  <h3>{product.name}</h3>
                  <div className="product-meta-row">
                    {product.brand && <span>{product.brand}</span>}
                    <span>{STORE_LABELS[product.storeId] || product.storeId}</span>
                  </div>

                  <div className="favorite-price-row">
                    <div>
                      {isOffer && originalPrice && (
                        <span className="product-old-price">${originalPrice.toFixed(2)}</span>
                      )}
                      <strong>${product.price.toFixed(2)}</strong>
                    </div>
                    <span>{product.stock} unidades</span>
                  </div>

                  <div className="favorite-actions">
                    <button className="btn-primary" onClick={() => addToCart(product._id)}>
                      <IconCart /> Agregar al carrito
                    </button>
                    <button className="favorite-remove" onClick={() => removeFavorite(product._id)}>
                      <IconHeart /> Quitar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
