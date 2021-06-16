const { Pool } = require('pg');

require('dotenv').config()
try {

  const pool = new Pool({
      connectionString:process.env.CONNECTION_URL,
      ssl: { rejectUnauthorized: false }
    })
    pool.connect();
    module.exports = pool;  
} catch (error) {
  console.error(error.message)
}

