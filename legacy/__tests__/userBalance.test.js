/**
 * @jest-environment node
 */

const mysql = require('mysql');

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

test('Usuario con saldo suficiente puede pagar', (done) => {
    const email = "juan@example.com";
    const amountToPay = 20;

    db.query('SELECT balance FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            done(err);
            return;
        }

        expect(results.length).toBeGreaterThan(0);

        expect(results[0].balance).toBeGreaterThanOrEqual(amountToPay);

        done();
    });
});
