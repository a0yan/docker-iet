require("dotenv").config()
const pool=require("./db")
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
   async(accessToken, refreshToken, profile, done)=>{
    const user = await pool.query("SELECT * FROM users WHERE google_id=$1", [profile.id])
    if (user.rows.length == 0) {
      const user = await pool.query("INSERT INTO users (google_id) VALUES($1) RETURNING *", [profile.id])
    }
    const userData = {
      google_id: profile.id,
      token: accessToken
    };
    done(null, userData);
  }
));