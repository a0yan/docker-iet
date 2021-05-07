require("dotenv").config()
module.exports=async(req,res,next)=>{
    try{
        const jwttoken=req.header("token")
        if(!jwttoken){
            return res.status(404).json("Not Authorized")
        }
        const payload=jwt.verify(jwttoken,process.env.JWT_SECRET)
        next();
    }
    catch(err){
        console.err(err.message)
        return res.status(403).json("Not Authorized")
    }
}