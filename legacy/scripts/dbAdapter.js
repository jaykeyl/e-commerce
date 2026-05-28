const mysql = require('mysql');

class MySQLAdapter {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
      }
      console.log('Connected to MySQL as id', this.connection.threadId);
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
        } else {
          console.log('Query results:', results);
          resolve(results);
        }
      });
    });
  }

  close() {
    this.connection.end();
  }
}

module.exports = MySQLAdapter;
