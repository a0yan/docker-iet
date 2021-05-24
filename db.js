require('dotenv').config()
try {
  const Client= require("pg").Client
  const client1 = new Client({
      connectionString:process.env.CONNECTION_URL,
      ssl: { rejectUnauthorized: false }
    })
    client1.connect();
    module.exports = client1;  
} catch (error) {
  console.error(error.message)
}

