require('dotenv').config()
try {
  const Client= require("pg").Client
  const client1 = new Client({
      connectionString:process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  const client2=new Client({
    connectionString:'postgres://xrgujyqzcpnbly:507c3fb4fb12706221fe78bbd01e298edc4123a427bbb43ff06296461018fc08@ec2-3-214-136-47.compute-1.amazonaws.com:5432/d6pffng4fofng6',
    ssl:{rejectUnauthorized:false}
  })
  client2.connect()
    client1.connect();
    module.exports = {client1,client2};  
} catch (error) {
  console.error(error.message)
}

