require('dotenv').config()
// JWT Secret Is generated randomly once and then stored for future verification
const jwt=require("jsonwebtoken");
const jwtGenerator=(user_id)=>{
    const payload={
        user:user_id
    }
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'2hr'})   
}
module.exports=jwtGenerator