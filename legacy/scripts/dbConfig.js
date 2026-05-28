//module.exports = {
//    host: 'localhost',
//    user: 'root',
//    password: '',
//    database: 'musicecommerce',
//  };
// const mysql = require('mysql');
import mysql from 'mysql';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'musicecommerce',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL 🎉');
});

// module.exports = connection;
export default connection;
