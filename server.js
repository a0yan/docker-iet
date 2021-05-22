// Configuration
require('dotenv').config()
const express=require("express")
const passport=require("passport")
const bcrypt=require("bcrypt")
const pool=require("./db").client1
const jwtG=require("./utils/jwtgenerator")
const jwt=require("jsonwebtoken");
const cors=require('cors');
const path=require('path')
const app=express()
//Middlewares
app.use(cors())
app.use(express.json())
app.use(passport.initialize()); 
app.use(passport.session())
//
const port=process.env.PORT || 5000
// process.env.NODE_ENV  for p4oduction
if (process.env.NODE_ENV==='production'){
  //server static content
  //npm run build on client
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
    const db_data=await pool.query(`select frequency,amplitude,phase,acceleration,time,timestamp from datatable where user_id=$1 and machine_id=$2 and location_id=$3 order by timestamp desc limit 1`,[user_id,machine_id,location_id])
    if (db_data.rows.length===0){
      res.status(202).json(null)
    }
    else{
      // console.log(db_data.rows[0].phase);
    res.status(202).json(db_data.rows[0])
    }  
  } catch (error) {
    console.error(error.message)
  }
  
})
app.get('/get-machine',async(req,res)=>{
  const user_id=req.headers.user
  try {
    const data=await pool.query('SELECT * FROM users where user_id=$1;',[user_id])
    res.json({machine_data:data.rows[0].machines,location_data:data.rows[0].locations})  
  } catch (error) {
    console.error(error.message);
  }
  
})
app.post('/get-machine-params',async(req,res)=>{
  try {
    const user_id=req.body.user
    const machine_id=req.body.machine_id
    const params=await pool.query(`SELECT * FROM machine_parameters WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" DESC LIMIT 100`,[user_id,machine_id])
    if (params.rows.length==0){
      res.json(false)
    }
    else{
    res.json(params.rows)
    } 
  } catch (error) {
    console.error(error.message)
  }
})

app.put('/update-downtime',async(req,res)=>{
try {
  const user_id=req.body.user_id
  const machine_id=req.body.machine_id
  const time=req.body.time
  const response=await pool.query("SELECT * FROM machine_downtime WHERE user_id=$1 AND machine_id=$2",[user_id,machine_id])
  if(response.rows.length!==0){
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
    const user_id=req.body.user_id
    const machine_id=req.body.machine_id
    const response=await pool.query("SELECT prev_downtime FROM machine_downtime WHERE user_id=$1 AND machine_id=$2;",[user_id,machine_id])
    res.send(response.rows[0])
  } catch (error) {
    
  }
})
app.post('/register',async(req,res)=>{
  try{
    const {email,password,machine,location}=req.body
    const user= await pool.query("SELECT * FROM users WHERE email= $1",[email])
    if(user.rows.length!==0){
      res.status(401).send("User Already Exists")
    }
    const saltRounds=10
    const salt=await bcrypt.genSalt(saltRounds)
    const bcryptPassword=await bcrypt.hash(password,salt)
    const new_user=await pool.query("INSERT INTO users (email,password,machines,locations) VALUES($1,$2,$3,$4) RETURNING * ",[email,bcryptPassword,machine,location])
    const token=jwtG(new_user.rows[0].user_id)
    const user_id=(new_user.rows[0].user_id)
    res.send({token,user_id})

    
  }catch(err){
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})



app.post('/login',async(req,res)=>{
  try{
    const {email,password}=req.body
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

// For Front-End Routes --Production
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client','build', 'index.html'));
});


// Listening
app.listen(port,()=>{
    console.log(`Running on PORT ${port}`);
})
