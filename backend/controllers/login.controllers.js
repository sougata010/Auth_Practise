import express from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import User from "../model/User.model.js";
import dotenv from "dotenv";
dotenv.config()

const jwt=jsonwebtoken
const router=express.Router()
function genRefresh(user){
    return jwt.sign({user:user.username},process.env.SECRET_KEY,{expiresIn:"7d"})
}
function genAccess(user){
    return jwt.sign({user:user.username},process.env.SECRET_KEY,{expiresIn:"1h"})
}
router.post("/",async(req,res)=>{
    const {username,password,email} = req.body;
    if (username){
        const user= await User.findOne({username});
        if(!user){
            return res.status(400).json({error:"User not found"});
        }
        const match=await bcrypt.compare(password,user.password)
        if(!match){
            return res.status(401).json({error:"Invalid password"})
        }
        const access=genAccess(user);
        const refresh=genRefresh(user);
        user.refreshToken=refresh;
        await user.save();
        res.status(200).json({access,refresh});

    }
    
    const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"User not found"});
        }
        const match=bcrypt.compare(password,user.password)
        if(!match){
            return res.status(401).json({error:"Invalid password"})
        }
         user.refreshToken=refresh;
        await user.save();
        res.status(200).json({access,refresh});
    
})
export default router;