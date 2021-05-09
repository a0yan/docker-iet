require('dotenv').config()
const pg = require("pg")
const Client=pg.Client
const client = new Client({
    connectionString:process.env.CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  })
  client.connect();
module.exports = client;