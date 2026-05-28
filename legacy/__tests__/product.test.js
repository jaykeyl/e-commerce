/**
 * @jest-environment node
 */

const mysql = require('mysql');

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'musicecommerce',
});

beforeAll((done) => {
    db.connect((err) => {
        if (err) throw err;
        done();
    });
});

afterAll((done) => {
    db.end(() => done());
});

test('Todos los productos deben tener un precio mayor a 0', (done) => {
    db.query('SELECT * FROM products_details', (err, results) => {
        if (err) throw err;

        results.forEach((product) => {
            expect(product.price).toBeGreaterThan(0);
        });

        done();
    });
});
