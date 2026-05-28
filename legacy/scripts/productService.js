const MySQLAdapter = require('./dbAdapter');
const dbConfig = require('./dbConfig');

class ProductService {
  constructor() {
    this.dbAdapter = new MySQLAdapter(dbConfig);
    this.dbAdapter.connect();
  }

  async getAllProducts() {
    const sql = 'SELECT * FROM products_details';
    try {
      const results = await this.dbAdapter.query(sql);
      console.log('Products fetched from DB:', results); // Mostrar productos en la consola
      return results;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    const sql = 'SELECT * FROM products_details WHERE ID = ?';
    try {
      const results = await this.dbAdapter.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  async addProductToCart(productId) {
    console.log(`Product ${productId} added to cart.`);
  }

  closeConnection() {
    this.dbAdapter.close();
  }
}

module.exports = ProductService;