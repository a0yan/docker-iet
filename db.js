require('dotenv').config()
try {
  const Client= require("pg").Client
  const client1 = new Client({
      connectionString:process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  const client2=new Client({
    connectionString:'postgres://djkifirajiwjbh:e4ab0bc607c1957eced36ac82c351ee49ace6a63f336653b6c882201f95bded5@ec2-54-160-96-70.compute-1.amazonaws.com:5432/d3c0p2cdmc5s8u',
    ssl:{rejectUnauthorized:false}
  })
  client2.connect()
    client1.connect();
    module.exports = {client1,client2};  
} catch (error) {
  console.error(error.message)
}

