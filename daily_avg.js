const pool1=require('./db')
try {
    const scheculed_query=async()=>{
        const response=await pool1.query(` insert into daily_avg(user_id,machine_id,daily_avg_power) select user_id,machine_id,avg(hourly_avg_power) as daily_avg_power from hourly_avg where "timestamp" >now() -interval '1 day'  group by user_id,machine_id`)   
       process.exit()
       }
       
       scheculed_query()
} catch (error) {
    console.error(error.message)
}

