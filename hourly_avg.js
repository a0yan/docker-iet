const pool1=require('./db')
const hourly_avg=async()=>{
try {
    // This query is run every hour calculating average power for previous one hour 
    // and storing it in hourly_avg table
    const response=await pool1.query(`insert into hourly_avg (user_id,machine_id,hourly_avg_power) select user_id,machine_id ,avg(power)as hourly_avg_power from machine_parameters  where "timestamp" >now() -interval '1 hour'   group by user_id,machine_id`)    

    process.exit()
} catch (error) {
 console.error(error.message)   
}
}
hourly_avg()