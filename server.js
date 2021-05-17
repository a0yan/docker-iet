// Configuration
require('dotenv').config()
const bodyParser = require('body-parser')
const express=require("express")
const passport=require("passport")
const bcrypt=require("bcrypt")
const pool=require("./db")
const jwtG=require("./utils/jwtgenerator")
const jwt=require("jsonwebtoken");
const cors=require('cors');
const path=require('path')
const app=express()
//Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
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

app.get('/get-data',async (req,res)=>{
  try {
    const location_id=parseInt((req.headers.location_id))
    const machine_id=parseInt((req.headers.machine_id))
    const user_id=req.headers.user
    const db_data=await pool.query(`select d.frequency,d.amplitude,d.phase,d.acceleration,d."time",d."timestamp" from users as u
    inner join user_machine_location as uml  
    on u.user_id=uml.user_id 
    inner join datatable as d 
    on u.user_id = d.data_id
    where d.machine_id=$1 and d.location_id=$2 and d.data_id=$3
    order by d."timestamp"  desc limit 1`,[machine_id,location_id,user_id])
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
    const data=await pool.query('SELECT * FROM user_machine_location where user_id=$1;',[user_id])
    res.json({machine_data:data.rows[0].machine_id,location_data:data.rows[0].location_id})  
  } catch (error) {
    console.error(error.message);
  }
  
})
app.get('/get-machine-params',async(req,res)=>{
  const user_id=req.headers.user
  const machine_id=req.headers.machine_id
  const params=await pool.query(`SELECT * FROM machine_parameters WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" DESC LIMIT 1`,[user_id,machine_id])
  res.send(params.rows[0])
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client','build', 'index.html'));
});

//Post Requests
app.post('/register',async(req,res)=>{
  try{
    const {email,password,machine,location}=req.body
    const user= await pool.query("SELECT * FROM users WHERE user_email= $1",[email])
    if(user.rows.length!==0){
      res.status(401).send("User Already Exists")
    }
    const saltRounds=10
    const salt=await bcrypt.genSalt(saltRounds)
    const bcryptPassword=await bcrypt.hash(password,salt)
    const new_user=await pool.query("INSERT INTO users (user_email,user_password) VALUES($1,$2) RETURNING * ",[email,bcryptPassword])
    await pool.query("INSERT INTO user_machine_location (user_id,machine_id,location_id) VALUES ($1,$2,$3)",[new_user.rows[0].user_id,machine,location])
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
    const user=await pool.query("SELECT * FROM users WHERE user_email=$1",[email])
    if(user.rows.length==0){
      return res.status(401).send("User Does Not Exist")
    }
    const validPassword=await bcrypt.compare(password,user.rows[0].user_password)
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


// Listening
app.listen(port,()=>{
    console.log(`Running on PORT ${port}`);
})
