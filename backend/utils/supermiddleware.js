import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function superauth(req,res,next){
    const role=req.user.roles;
    if(role=="superintendent"){
        next()
    }
    else{
       return res.status(401).json({error:"You don't have access to this page"});
    }
}
export default superauth