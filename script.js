const pool1=require('./db').client1
const pool2=require('./db').client2
const scheculed_query=async()=>{
 const response1=await pool1.query("select user_id,machine_id ,avg(power)as avg_power from machine_parameters where extract(day from (timestamp) at time zone 'IST')=extract(day from (timestamp) at time zone 'IST')  group by user_id,machine_id")  
//  const response2=await pool2.query(`insert into avg_power (user_id,machine_id,avg_power) values (${response1.rows.slice(1,-1)})`)
console.log(response1.rows);   
}
scheculed_query()
// process.exit()
// 2021-05-21T20:39:25.247Z