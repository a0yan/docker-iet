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
    return res.json(true)
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
  const q=req.headers.db_name
  const db_data=await pool.query(`SELECT * from  ${q} ORDER BY datecreated DESC LIMIT 1;`)
  res.status(202).json(db_data.rows[0])
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client','build', 'index.html'));
});

//Post Requests
app.post('/register',async(req,res)=>{
  try{
    const {email,password}=req.body
    const user= await pool.query("SELECT * FROM users WHERE user_email= $1",[email])
    if(user.rows.length!==0){
      res.status(401).send("User Already Exists")
    }
    const saltRounds=10
    const salt=await bcrypt.genSalt(saltRounds)
    const bcryptPassword=await bcrypt.hash(password,salt)
    const new_user=await pool.query("INSERT INTO users (user_email,user_password) VALUES($1,$2) RETURNING * ",[email,bcryptPassword])
    const token=jwtG(new_user.rows[0].user_id)
    res.redirect('http://localhost:3000/?token='+token)
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
    res.redirect('http://localhost:3000/?token='+token)


  }
  catch(err){
    console.error(err.message)
  }
})


// Listening
app.listen(port,()=>{
    console.log(`Running on PORT ${port}`);
})
