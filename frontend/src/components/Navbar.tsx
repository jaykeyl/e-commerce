import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

// ── SVG Icons ──────────────────────────────────────────────────
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconReports = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
);

const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/>
  </svg>
);

const IconBrandM = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,20 4,4 12,14 20,4 20,20"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = () => {
    if (!user) return '?';
    return (user.firstName || '?').charAt(0).toUpperCase();
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <IconBrandM />
          </div>
          <span className="sidebar-brand-text">MultiStore</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menú</span>

          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-item-icon"><IconStore /></span>
            Productos
          </Link>

          {user && (
            <Link to="/cart" className={`nav-item ${isActive('/cart') ? 'active' : ''}`}>
              <span className="nav-item-icon"><IconCart /></span>
              Carrito
            </Link>
          )}

          {user && (
            <Link to="/orders" className={`nav-item ${isActive('/orders') ? 'active' : ''}`}>
              <span className="nav-item-icon"><IconOrders /></span>
              Mis pedidos
            </Link>
          )}

          {user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER') && (
            <>
              <span className="sidebar-nav-label">Admin</span>
              <Link to="/reports" className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
                <span className="nav-item-icon"><IconReports /></span>
                Reportes
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-promo">
          <div className="sidebar-promo-icon">
            <IconTag />
          </div>
          <div className="sidebar-promo-title">Ofertas exclusivas</div>
          <div className="sidebar-promo-desc">Descubre productos con descuentos únicos por tiempo limitado.</div>
          <button className="sidebar-promo-btn">Ver ofertas →</button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-socials">
            <a href="#" className="social-icon" title="Instagram"><IconInstagram /></a>
            <a href="#" className="social-icon" title="Facebook"><IconFacebook /></a>
            <a href="#" className="social-icon" title="Twitter"><IconTwitter /></a>
            <a href="#" className="social-icon" title="YouTube"><IconYoutube /></a>
          </div>
          <div className="sidebar-copyright">© 2024 MultiStore<br/>Todos los derechos reservados.</div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="theme-toggle">
          <span className="theme-icon"><IconSun /></span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(d => !d)}
            />
            <span className="toggle-slider" />
          </label>
          <span className="theme-icon"><IconMoon /></span>
        </div>

        {user ? (
          <>
            <div className="topbar-user">
              <div className="user-avatar">{getUserInitials()}</div>
              <div>
                <div className="user-name">{user.firstName} &bull; {user.role}</div>
              </div>
              <span className="user-caret"><IconChevronDown /></span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-nav">Entrar</Link>
            <Link to="/register" className="btn-nav btn-nav-outline">Registrarse</Link>
          </>
        )}
      </header>
    </>
  );
}
