import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function auth(req,res,next){
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
           return res.status(401).json({error:"Access denied. No token provided."});
        }
        
        const token = authHeader.split(" ")[1];
        
        const pass = jsonwebtoken.verify(token,process.env.SECRET_KEY);
        
        req.user = pass;
        next();
    } catch (error) {
        res.status(401).json({error:"Access denied. Invalid or expired token."})
    }
}

export default auth