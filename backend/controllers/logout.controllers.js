import express from "express";
import User from "../model/User.model.js";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

dotenv.config();

const router = express.Router();
router.post("/",async(req,res)=>{
   const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
           return res.status(401).json({error:"Access denied. No token provided."});
        }
        
        const token = authHeader.split(" ")[1];
        const pass = jsonwebtoken.verify(token,process.env.SECRET_KEY);
    const user = await User.findOne({username:pass.username});
    if(!user){
        return res.status(400).json({error:"Logout Unsuccessful"}); 

    }
    user.refreshToken = null;
    await user.save();
    res.status(200).json({message:'Logout successfully'});
})

export default router