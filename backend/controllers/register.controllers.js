import express from "express";
import bcrypt from "bcrypt";
import User from "../model/User.model.js";


const router=express.Router()

router.post("/register",async(req,res)=>{
    const {username,password,email} = req.body;
    const salt = await bcrypt.genSalt(7);
    const hased_password = await bcrypt.hash(password,salt);
    const user = new User({
        "username":username,"password":hased_password,"email":email
    });
    await user.save();
})
export default router;