const pool1=require('./db').client1
const pool2=require('./db').client2
try {
    const scheculed_query=async()=>{
        const response1=await pool1.query("select user_id,machine_id ,avg(power)as avg_power from machine_parameters where extract(day from (timestamp) at time zone 'IST')=extract(day from (timestamp) at time zone 'IST')  group by user_id,machine_id")  
       for(let i=0;i<response1.rows.length;i++){
           if(response1.rows!=null){
           await pool2.query("insert into avg_power (user_id,machine_id,avg_power) values($1,$2,$3)",[response1.rows[i].user_id,response1.rows[i].machine_id,Math.round(response1.rows[i].avg_power,2)])
            }
       }
        
       process.exit()
       }
       
       scheculed_query()
} catch (error) {
    console.error(error.message)
}

