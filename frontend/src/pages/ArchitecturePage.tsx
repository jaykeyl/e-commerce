const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
  </svg>
);

const IconServer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="8" rx="2"/>
    <rect x="2" y="13" width="20" height="8" rx="2"/>
    <line x1="6" y1="7" x2="6.01" y2="7"/>
    <line x1="6" y1="17" x2="6.01" y2="17"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
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

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
);

const IconSpark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/>
    <path d="M19 15l.8 2.7L22 18.5l-2.2.8L19 22l-.8-2.7-2.2-.8 2.2-.8L19 15z"/>
  </svg>
);

const postgresItems = [
  'Usuarios y roles RBAC',
  'Tiendas y direcciones',
  'Órdenes e ítems',
  'Pagos tokenizados',
  'Facturas emitidas',
  'Transacciones ACID',
];

const mongoItems = [
  'Catálogo dinámico',
  'Atributos BSON por categoría',
  'Carritos documentales',
  'Auditoría de checkout',
  'Tags, variantes y arreglos',
  'Consultas flexibles',
];

const flowSteps = [
  {
    title: '1. Cliente compra',
    desc: 'El usuario agrega productos al carrito desde el frontend.',
    db: 'MongoDB',
  },
  {
    title: '2. API valida carrito',
    desc: 'La API consulta productos y stock en MongoDB.',
    db: 'MongoDB',
  },
  {
    title: '3. Transacción ACID',
    desc: 'PostgreSQL crea orden, pago y factura de forma atómica.',
    db: 'PostgreSQL',
  },
  {
    title: '4. Auditoría documental',
    desc: 'MongoDB registra el checkout y descuenta stock.',
    db: 'MongoDB',
  },
];

export default function ArchitecturePage() {
  return (
    <div className="page architecture-page">
      <div className="architecture-hero">
        <div>
          <span className="architecture-eyebrow">Persistencia políglota</span>
          <h1>
            Arquitectura <span>PostgreSQL + MongoDB</span>
          </h1>
          <p>
            MultiStore separa datos transaccionales y datos documentales para construir
            un e-commerce flexible, consistente y defendible.
          </p>
        </div>

        <div className="architecture-hero-card">
          <IconSpark />
          <strong>Diseño híbrido</strong>
          <span>SQL para consistencia. NoSQL para flexibilidad.</span>
        </div>
      </div>

      <div className="architecture-map">
        <div className="architecture-node frontend-node">
          <div className="node-icon">
            <IconCart />
          </div>
          <h3>Frontend React</h3>
          <p>Interfaz cliente/admin, carrito, checkout, facturas y reportes.</p>
        </div>

        <div className="architecture-connector">
          <IconArrow />
        </div>

        <div className="architecture-node api-node">
          <div className="node-icon">
            <IconServer />
          </div>
          <h3>API Express</h3>
          <p>Middleware de integración, autenticación JWT, RBAC y reglas de negocio.</p>
        </div>

        <div className="architecture-connector split">
          <IconArrow />
        </div>

        <div className="architecture-db-grid">
          <div className="architecture-db-card postgres-card">
            <div className="db-card-header">
              <div className="node-icon">
                <IconDatabase />
              </div>
              <div>
                <h3>PostgreSQL</h3>
                <span>Datos relacionales y transaccionales</span>
              </div>
            </div>

            <ul>
              {postgresItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="architecture-db-card mongo-card">
            <div className="db-card-header">
              <div className="node-icon">
                <IconDatabase />
              </div>
              <div>
                <h3>MongoDB</h3>
                <span>Datos documentales y flexibles</span>
              </div>
            </div>

            <ul>
              {mongoItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="architecture-section">
        <div className="section-heading">
          <h2>Flujo de checkout integrado</h2>
          <p>
            El proceso de compra demuestra la colaboración entre ambos motores de base de datos.
          </p>
        </div>

        <div className="flow-grid">
          {flowSteps.map((step, index) => (
            <div key={step.title} className="flow-card">
              <div className="flow-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <span className={step.db === 'MongoDB' ? 'db-pill mongo' : 'db-pill postgres'}>
                {step.db}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="architecture-section architecture-proof">
        <div className="proof-card">
          <IconShield />
          <h3>Consistencia transaccional</h3>
          <p>
            La orden, el pago y la factura se crean dentro de una transacción ACID en PostgreSQL.
            Si falla una parte, no se confirma el proceso completo.
          </p>
        </div>

        <div className="proof-card">
          <IconReceipt />
          <h3>Facturación automática</h3>
          <p>
            Cada orden nueva genera una factura con número único, subtotal, impuesto, total,
            cliente, tienda y estado de pago.
          </p>
        </div>

        <div className="proof-card">
          <IconDatabase />
          <h3>Catálogo dinámico</h3>
          <p>
            MongoDB permite que ropa, electrónica, muebles, cocina y adornos tengan atributos
            diferentes sin modificar tablas relacionales.
          </p>
        </div>
      </div>

      <div className="architecture-section">
        <div className="section-heading">
          <h2>Relación entre bases</h2>
          <p>
            La API une ambos mundos usando identificadores compartidos y referencias cruzadas.
          </p>
        </div>

        <div className="link-table">
          <div>
            <strong>userId</strong>
            <span>Relaciona usuarios PostgreSQL con carritos, preferencias y auditorías MongoDB.</span>
          </div>
          <div>
            <strong>mongoProductId</strong>
            <span>Conecta los productos del catálogo MongoDB con los ítems de orden en PostgreSQL.</span>
          </div>
          <div>
            <strong>orderId</strong>
            <span>Permite auditar en MongoDB una orden creada en PostgreSQL.</span>
          </div>
          <div>
            <strong>invoiceId</strong>
            <span>Asocia la factura relacional con la auditoría documental del checkout.</span>
          </div>
        </div>
      </div>
    </div>
  );
}