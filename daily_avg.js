const pool1=require('./db')
const timeConverter=('./utils/timeConverter.js')
try {
    const scheculed_query=async()=>{
        
        const yesterday_uptime=await pool1.query(`WITH DELETED_DATA as (delete from total_uptime returning *)
        INSERT INTO yesterday_uptime (user_id,machine_id,yesterday_uptime) SELECT * FROM DELETED_DATA 
        ON CONFLICT (user_id,machine_id) DO UPDATE SET yesterday_uptime=EXCLUDED.yesterday_uptime; 
        `)
        const response=await pool1.query(` insert into daily_avg(user_id,machine_id,daily_avg_power) 
        select user_id,machine_id,avg(hourly_avg_power) as daily_avg_power from hourly_avg where "timestamp" >now() -interval '1 day'  group by user_id,machine_id`)   
       process.exit()
       }
       
       scheculed_query()
} catch (error) {
    console.error(error.message)
}

