// Configuration
require('dotenv').config()
const express=require("express")
const passport=require("passport")
const axios=require("axios")
const bcrypt=require("bcrypt")
const pool=require("./db")
const jwtG=require("./utils/jwtgenerator")
const jwt=require("jsonwebtoken");
const cors=require('cors');
const path=require('path')
const compression=require('compression')
const enforce=require('express-sslify')
const app=express()
//Middlewares
app.use(cors())
app.use(express.json())
app.use(passport.initialize()); 
app.use(passport.session())
//
const port=process.env.PORT || 5000
// process.env.NODE_ENV  for production
if (process.env.NODE_ENV==='production'){
  //server static content
  //npm run build on client
  app.use(compression())
  app.use(enforce.HTTPS({ trustProtoHeader: true }))
  app.use(express.static(path.join(__dirname,"client/build")))  
}
require('./passport')
//Routes
app.get('/is-verified',async(req,res)=>{
  const jwttoken=req.header("token")
  if(!jwttoken){
      return res.json(false)
  }
  try {
    const payload=await jwt.verify(jwttoken,process.env.JWT_SECRET)
    
    return res.status(201).json({user:payload.user})
  } catch (error) {
   return res.json(false) 
  }
  
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/callback', 
passport.authenticate('google', { failureRedirect: '/auth/google' }),
(req, res)=>{
// Successful authentication, redirect home.
const token=req.user.token
const jwttoken=jwtG(token)
res.redirect(process.env.APP_URL+'/?token='+jwttoken);
})


//Post Requests
app.post('/get-data',async (req,res)=>{
  try {
    const location_id=parseInt((req.body.location_id))
    const machine_id=parseInt((req.body.machine_id))
    const user_id=req.body.user
    const bearing_number=req.body.bearing_number
    const db_data=await pool.query(`select frequency,amplitude,phase,acceleration,time,timestamp from datatable where user_id=$1 and machine_id=$2 and location_id=$3 order by timestamp desc limit 1`,[user_id,machine_id,location_id])
    const bearing_data=await pool.query('select bpfo,bpfi,ftf,bsf from bearing_ratios where bearing_number=$1',[bearing_number])

    if (db_data.rows.length===0){
      res.status(202).json(null)
    }
    else{
      // console.log(db_data.rows[0].phase);
    res.status(202).json({db_data:db_data.rows[0],bearing_data:bearing_data.rows[0]})
    }  
  } catch (error) {
    console.error(error.message)
  }
  
})
app.get('/get-machine',async(req,res)=>{
  const user_id=req.headers.user
  try {
    const data=await pool.query('SELECT * FROM users where user_id=$1;',[user_id])
    const parsed_data=JSON.parse(data.rows[0].machines)
    res.json({machine_data:parsed_data,factory_name:data.rows[0].factory_name})  
  } catch (error) {
    console.error(error.message);
  }
  
})
app.post('/get-machine-params',async(req,res)=>{
  try {
    const user_id=req.body.user
    const machine_id=req.body.machine_id
    const daily_avg= await pool.query(`SELECT daily_avg_power,"timestamp" FROM daily_avg WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" LIMIT 100 `,[user_id,machine_id])
    const hourly_avg=await pool.query(`SELECT hourly_avg_power,"timestamp" FROM hourly_avg WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" LIMIT 100`,[user_id,machine_id])
    const params=await pool.query(`SELECT * FROM machine_parameters WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" DESC LIMIT 100`,[user_id,machine_id])
    if (params.rows.length==0){
      res.json(false)
    }
    else{
    res.json({data:params.rows,
    hourly_avg:hourly_avg.rows,
    daily_avg:daily_avg.rows
    })
    } 
  } catch (error) {
    console.error(error.message)
  }
})
let updated=false
app.put('/update-downtime',async(req,res)=>{
try {
  const user_id=req.body.user_id
  const machine_id=req.body.machine_id
  const time=req.body.time
  const response=await pool.query("SELECT * FROM machine_downtime WHERE user_id=$1 AND machine_id=$2",[user_id,machine_id])
  if(response.rows.length!==0){
    if(updated===true){
      updated=false
      const response2=await pool.query("SELECT * from total_uptime WHERE user_id=$1 AND machine_id=$2",[user_id,machine_id])
      if(response2.rows.length!==0){
        await pool.query('UPDATE total_uptime SET uptime=$1 WHERE user_id=$2 AND machine_id=$3',[response2.rows[0].uptime+new Date(time).getTime()-response.rows[0].prev_downtime.getTime(),user_id,machine_id])
      }
      else{
        await pool.query('INSERT INTO total_uptime (user_id,machine_id,uptime) values ($1,$2,$3)',[user_id,machine_id,new Date(time).getTime()-response.rows[0].prev_downtime.getTime()])
      }
    }
    await pool.query("UPDATE machine_downtime SET prev_downtime=$1 WHERE user_id=$2",[time,user_id])
  }
  else{
    await pool.query("INSERT INTO machine_downtime (user_id,machine_id,prev_downtime) VALUES ($1,$2,$3)",[user_id,machine_id,time])
  }
  res.sendStatus(201)
   
} catch (error) {
  console.error(error.message)
}
})
app.post('/get-downtime',async(req,res)=>{
  try {
    updated=true
    const user_id=req.body.user_id
    const machine_id=req.body.machine_id
    const response=await pool.query("SELECT prev_downtime FROM machine_downtime WHERE user_id=$1 AND machine_id=$2;",[user_id,machine_id])
    res.send(response.rows[0])
  } catch (error) {
    console.error(error.message)
  }
})
app.post(`/get-yesterday-uptime`,async(req,res)=>{
  try{
    const user_id=req.body.user_id
    const machine_id=req.body.machine_id
  const response=await pool.query(`SELECT yesterday_uptime from yesterday_uptime WHERE user_id=$1 AND machine_id=$2`,[user_id,machine_id])
  if(response.rows.length===0){
    res.json(null)
  }
  else{
    res.json(response.rows[0])
  }
}
catch(error){
console.error(error.message)
}
}
)
app.post('/record-machine-params',async(req,res)=>{
  const machine_params=req.body.machine_params
  try{
  await pool.query("INSERT INTO machine_record (process_id,user_id,machine_id,min_oil_level,oil_level,max_oil_level,oil_quality,power,temperature) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
[machine_params.process_id,machine_params.user_id,machine_params.machine_id,machine_params.min_oil_level,machine_params.oil_level,machine_params.max_oil_level,machine_params.oil_quality,machine_params.power,machine_params.temperature])
res.sendStatus(202)  
}
  catch(error){
    res.send("Record already Exists")
  }
})
app.post('/register',async(req,res)=>{
  try{
    const {
      master_username,master_password,email,password,machines,factory_name
    }=req.body
    console.log(req.body);
    const new_machines=JSON.stringify(machines)
    if(master_username===process.env.MASTER_USERNAME && master_password===process.env.MASTER_PASSWORD){
    const user= await pool.query("SELECT * FROM users WHERE email= $1",[email])
    if(user.rows.length!==0){
      res.status(401).send("User Already Exists")
      return
    }
    const saltRounds=10
    const salt=await bcrypt.genSalt(saltRounds)
    const bcryptPassword=await bcrypt.hash(password,salt)
    const new_user=await pool.query("INSERT INTO users (email,password,machines,factory_name) VALUES($1,$2,$3,$4) RETURNING * ",[email,bcryptPassword,new_machines,factory_name])
    const token=jwtG(new_user.rows[0].user_id)
    const user_id=(new_user.rows[0].user_id)
    res.send({token,user_id})

    }
    else{
      res.status(404).send("Master Username or Password is Incorrect")
    }  
  }catch(err){
    console.error(err.message)
    res.status(500).send("Server Error")
  }
  
})



app.post('/login',async(req,res)=>{
  try{
    const {email,password,token_captcha}=req.body
    const human=await validateHuman(token_captcha)
    if(!human){
      res.status(400)
      res.send("Captcha Verification Failed")
      return 
    }
    const user=await pool.query("SELECT * FROM users WHERE email=$1",[email])
    if(user.rows.length==0){
      return res.status(401).send("User Does Not Exist")
    }
    const validPassword=await bcrypt.compare(password,user.rows[0].password)
    if(!validPassword){
      return res.status(401).send("Incorrect Password")
    }
    const token=jwtG(user.rows[0].user_id)
    const user_id=(user.rows[0].user_id)
    res.status(202).send({token,user_id})

  }
  catch(err){
    console.error(err.message)
  }
})

const validateHuman=async(token_captcha)=>{
  const secret=process.env.CAPTCHA_KEY_SERVER
  const res=await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token_captcha}`,{
    headers:{ "Content-Type": "application/x-www-form-urlencoded" }
  })
  return res.data.success
}

// For Front-End Routes --Production
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client','build', 'index.html'));
});


// Listening
app.listen(port,()=>{
    console.log(`Running on PORT ${port}`);
})
