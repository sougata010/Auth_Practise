import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function auth(req,res,next){
    try {
        const token=req.headers.authorization.split(" ")[1];
        if(!token){
           return res.status(400).json({error:"Invalid token"});
        }
        const pass = jsonwebtoken.verify(token,process.env.SECRET_KEY);
        if(!pass){
            return res.status(403).json({error:"Access token expired"});
        }
        req.user=pass;
        next();
    } catch (error) {
        console.log(error);
        res.status(403).json({error:"Expired access token"})
    }
}

export default auth