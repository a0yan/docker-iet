// Configuration
require('dotenv').config()   // To store environment variables
const express = require("express")
const axios = require("axios")
const bcrypt = require("bcrypt")
const pool = require("./db")
const jwtG = require("./utils/jwtgenerator")
const jwt = require("jsonwebtoken");
const cors = require('cors');
const path = require('path')
const compression = require('compression')
const enforce = require('express-sslify')
const app = express()
//Middlewares
app.use(cors())
app.use(express.json())
//
const port = process.env.PORT || 5000
// process.env.NODE_ENV  for production
if (process.env.NODE_ENV === 'production') {
  //server static content
  //npm run build on client
  app.use(compression())
  app.use(enforce.HTTPS({ trustProtoHeader: true }))
  app.use(express.static(path.join(__dirname, "client/build")))
}
//Routes
app.get('/is-verified', async (req, res) => {
  // To verify if the token recieved from the frontend is correct or not
  const jwttoken = req.header("token")
  if (!jwttoken) {
    return res.json(false)
  }
  try {
    //With the help of secret stored in env it verifies if it is a valid token created by us or not
    const payload = await jwt.verify(jwttoken, process.env.JWT_SECRET) 
    return res.status(201).json({ user: payload.user })
  } catch (error) {
    return res.json(false)
  }

})
//Post Requests
app.post('/get-data', async (req, res) => {
  // Used to fetch all the data required to plot the 3 graphs of FFT,Phase and Time History
  try {
    const location_id = parseInt((req.body.location_id))
    const machine_id = parseInt((req.body.machine_id))
    const user_id = req.body.user
    const bearing_number = req.body.bearing_number
    // Simple query to datatable to get the latest values of freq,amp,phase,acc,time from data table of particular machine and location.
    const db_data = await pool.query(`select frequency,amplitude,phase,acceleration,time,timestamp from datatable where user_id=$1 and machine_id=$2 and location_id=$3 order by timestamp desc limit 1`, [user_id, machine_id, location_id])
    // Retrieves the bearing number if it  matches else empty strings are used as place holders
    const bearing_data = await pool.query('select bpfo,bpfi,ftf,bsf from bearing_ratios where bearing_number=$1', [bearing_number])
    if (db_data.rows.length === 0) {
      res.status(202).json(null)
    }
    else {
      res.status(202).json({ db_data: db_data.rows[0], bearing_data: bearing_data.rows[0] })
    }
  } catch (error) {
    console.error(error.message)
  }

})
app.get('/get-machine', async (req, res) => {
  // This route is used to send the array of dictionary elemnets in which each dictionary reprasents machines and its keys are locations
  // Along with the Factory name
  // All this info is stored during the registration.
  const user_id = req.headers.user
  try {
    const data = await pool.query('SELECT * FROM users where user_id=$1;', [user_id])
    const parsed_data = JSON.parse(data.rows[0].machines)
    res.json({ machine_data: parsed_data, factory_name: data.rows[0].factory_name })
  } catch (error) {
    console.error(error.message);
  }

})
app.post('/get-machine-params', async (req, res) => {
  // This Route performs 3 tasks
  // 1. Querying the daily_avg  power of the machine from daily_avg table
  // 2. Querying the hourly_avg power
  // 3. Querying the past 100 parameters of the machine from machine_parameters with latest being first 
  try {
    const user_id = req.body.user
    const machine_id = req.body.machine_id
    const daily_avg = await pool.query(`SELECT daily_avg_power,"timestamp" FROM daily_avg WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" LIMIT 100 `, [user_id, machine_id])
    const hourly_avg = await pool.query(`SELECT hourly_avg_power,"timestamp" FROM hourly_avg WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" LIMIT 100`, [user_id, machine_id])
    const params = await pool.query(`SELECT * FROM machine_parameters WHERE user_id=$1 AND machine_id=$2 ORDER BY "timestamp" DESC LIMIT 100`, [user_id, machine_id])
    if (params.rows.length == 0) {
      res.json(false)
    }
    else {
      res.json({
        data: params.rows,
        hourly_avg: hourly_avg.rows,
        daily_avg: daily_avg.rows
      })
    }
  } catch (error) {
    console.error(error.message)
  }
})
let updated = false
app.put('/update-downtime', async (req, res) => {
  // This is a bit tricky
  // This route is called on every rerender when power is below threshold level but we need to store the previous uptime
  // only the first time when the power is below the significant level
  try {
    const user_id = req.body.user_id
    const machine_id = req.body.machine_id
    const time = req.body.time
    const response = await pool.query("SELECT * FROM machine_downtime WHERE user_id=$1 AND machine_id=$2", [user_id, machine_id])
    if (response.rows.length !== 0) {
      if (updated === true) {
        updated = false // updated is changed to false so that it is accesed only once during consecutive calls
        // In this query we check if there is a row for this user and machine which we can update else we insert the row
        const response2 = await pool.query("SELECT * from total_uptime WHERE user_id=$1 AND machine_id=$2", [user_id, machine_id])
        if (response2.rows.length !== 0) {
          // To update the uptime as we are calculating total uptime for a day we also have to add the previous uptime to the new uptimw
          // Which is calculated by subtracting the current time with the previous downtime
          // uptime is stored in miliseconds.
          await pool.query('UPDATE total_uptime SET uptime=$1 WHERE user_id=$2 AND machine_id=$3', [response2.rows[0].uptime + new Date(time).getTime() - response.rows[0].prev_downtime.getTime(), user_id, machine_id])
        }
        else {
          // We Only insert the calculated uptime as there's nothing to update
          await pool.query('INSERT INTO total_uptime (user_id,machine_id,uptime) values ($1,$2,$3)', [user_id, machine_id, new Date(time).getTime() - response.rows[0].prev_downtime.getTime()])
        }
      }
      // This is outside the IF block of (updated===true) as on every re render we have to store the downtime as the current time
      await pool.query("UPDATE machine_downtime SET prev_downtime=$1 WHERE user_id=$2", [time, user_id])
    }
    else {
      await pool.query("INSERT INTO machine_downtime (user_id,machine_id,prev_downtime) VALUES ($1,$2,$3)", [user_id, machine_id, time])
    }
    res.sendStatus(201)

  } catch (error) {
    console.error(error.message)
  }
})
app.post('/get-downtime', async (req, res) => {
  try {
    // When the power of the machine is above threshold level send the previous downtime of the machine to frontend which
    // is subtracted from the current time to display uptime 
    updated = true // The value is again changed to true as when the machine goes down we can store its uptime.
    const user_id = req.body.user_id
    const machine_id = req.body.machine_id
    const response = await pool.query("SELECT prev_downtime FROM machine_downtime WHERE user_id=$1 AND machine_id=$2;", [user_id, machine_id])
    res.send(response.rows[0])
  } catch (error) {
    console.error(error.message)
  }
})
app.post(`/get-yesterday-uptime`, async (req, res) => {
  // This Route is run only once as it sends the yesterdays total uptime to the frontend 
  try {
    const user_id = req.body.user_id
    const machine_id = req.body.machine_id
    const response = await pool.query(`SELECT yesterday_uptime from yesterday_uptime WHERE user_id=$1 AND machine_id=$2`, [user_id, machine_id])
    if (response.rows.length === 0) {
      res.json(null)
    }
    else {
      res.json(response.rows[0])
    }
  }
  catch (error) {
    console.error(error.message)
  }
}
)
app.post('/record-machine-params', async (req, res) => {
  // Wheneber there's an issue and the user clicks on the Record Issue Button
  // All the machine Parameters are stored on a machine record table
  const machine_params = req.body.machine_params
  try {
    await pool.query("INSERT INTO machine_record (process_id,user_id,machine_id,min_oil_level,oil_level,max_oil_level,oil_quality,power,temperature) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [machine_params.process_id, machine_params.user_id, machine_params.machine_id, machine_params.min_oil_level, machine_params.oil_level, machine_params.max_oil_level, machine_params.oil_quality, machine_params.power, machine_params.temperature])
    res.sendStatus(202).send("Issue Recorded Sucessfully")
  }
  catch (error) {
    res.send("Record already Exists")
  }
})
app.post('/register', async (req, res) => {
  // Recieves the usercredentials,machine array and Factory name from the register page of the frontend  
  try {
    const {
      master_username, master_password, email, password, machines, factory_name
    } = req.body
    const new_machines = JSON.stringify(machines)
    if (master_username === process.env.MASTER_USERNAME && master_password === process.env.MASTER_PASSWORD) {
      const user = await pool.query("SELECT * FROM users WHERE email= $1", [email])
      if (user.rows.length !== 0) {
        res.status(401).send("User Already Exists")
        return
      }
      const saltRounds = 10 // used for encrypting passwords
      const salt = await bcrypt.genSalt(saltRounds) // adding random chars to the hashing password
      const bcryptPassword = await bcrypt.hash(password, salt)
      const new_user = await pool.query("INSERT INTO users (email,password,machines,factory_name) VALUES($1,$2,$3,$4) RETURNING * ", [email, bcryptPassword, new_machines, factory_name])
      const user_id = (new_user.rows[0].user_id)
      res.send({ user_id })

    }
    else {
      // Admin Access is not available
      res.status(404).send("Master Username or Password is Incorrect")
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }

})



app.post('/login', async (req, res) => {
  try {
    const { email, password, token_captcha } = req.body
    let human = await validateHuman(token_captcha)
    if (!human) {
      res.status(400)
      res.send("Captcha Verification Failed")
      return
    }
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email])
    if (user.rows.length == 0) {
      return res.status(401).send("User Does Not Exist")
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password)
    if (!validPassword) {
      return res.status(401).send("Incorrect Password")
    }
    const token = jwtG(user.rows[0].user_id) // Generates a token used for creating a session
    const user_id = (user.rows[0].user_id)
    res.status(202).send({ token, user_id })

  }
  catch (err) {
    console.error(err.message)
  }
})

const validateHuman = async (token_captcha) => {
  // uses google servers to verify captcha
  const secret = process.env.CAPTCHA_KEY_SERVER
  const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token_captcha}`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  })
  return res.data.success
}

// For Front-End Routes --Production
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});


// Listening
app.listen(port, () => {
  console.log(`Running on PORT ${port}`);
})
