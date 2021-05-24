const pool2=require('./db').client2
try {
    const scheculed_query=async()=>{
        const response1=await pool2.query(`with deleted as (delete from hourly_avg ha where "timestamp" at time zone 'IST'>now() at time zone 'IST' -interval '1 day' returning *)
        select user_id,machine_id,avg(hourly_avg_power) as daily_avg_power from deleted group by user_id,machine_id`)  
        if(response1.rows!=null){
        for(let i=0;i<response1.rows.length;i++){
            // console.log(response1.rows);
           await pool2.query("insert into daily_avg (user_id,machine_id,daily_avg_power) values($1,$2,$3)",[response1.rows[i].user_id,response1.rows[i].machine_id,Math.round(response1.rows[i].daily_avg_power,2)])
            }
       }
        
       process.exit()
       }
       
       scheculed_query()
} catch (error) {
    console.error(error.message)
}

