import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/User.model.js";

dotenv.config();
const router = express.Router();

router.post("/",async(req,res)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Refresh token missing or malformed." });
        }
    const refresh=authHeader.split(' ')[1];
    const verified=jsonwebtoken.verify(refresh,process.env.SECRET_KEY);
    if(!verified){
        res.status(403).json({error:"Session Expired"});
    }
    const user = await User.findOne({username:verified.username}).select("+username +roles +refreshToken")
    if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
    if(!(user.refreshToken==refresh)){
        return res.status(403).json({error:"Invalid refresh token"});
    }
    const access =jsonwebtoken.sign({username: user.username, roles: user.roles},process.env.SECRET_KEY,{expiresIn: '1h'});
    res.status(201).json({access})
})

export default router