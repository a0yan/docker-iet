const pool1=require('./db').client1
const pool2=require('./db').client2
const hourly_avg=async()=>{
try {
    const response1=await pool1.query(`with deleted as (delete from machine_parameters where "timestamp" at time zone 'IST' >(now() at time zone 'IST'-interval '1 hour') returning *)
    select user_id,machine_id ,avg(power)as avg_power from deleted group by user_id,machine_id `)
    if (response1.rows!==null){
        for (let i=0 ;i<response1.rows.length;i++) {
            await pool2.query(`insert into hourly_avg (user_id,machine_id,hourly_avg_power) values($1,$2,$3)`,[response1.rows[i].user_id,response1.rows[i].machine_id,Math.round(response1.rows[i].avg_power,2)])
        }
    }
    process.exit()
} catch (error) {
 console.error(error.message)   
}
}
hourly_avg()