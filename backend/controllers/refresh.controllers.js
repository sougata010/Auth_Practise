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
    const access=authHeader.split(' ')[1];
    const user_access=jsonwebtoken.decode(access)
    const user = await User.findOne({username:user_access.username}).select("+username +roles +refreshToken")
    if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
    const verified=jsonwebtoken.verify(user.refreshToken,process.env.SECRET_KEY);
    if(!verified){
        return res.status(400).json({error:"Token expired please re-login"})
    }
    
    const newaccess =jsonwebtoken.sign({username: user.username, roles: user.roles},process.env.SECRET_KEY,{expiresIn: '1h'});
    res.status(201).json({newaccess})
})

export default router