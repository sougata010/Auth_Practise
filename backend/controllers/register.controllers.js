import express from "express";
import bcrypt from "bcrypt";
import User from "../model/User.model.js";


const router=express.Router()

router.post("/register",async(req,res)=>{
    try{const {username,password,email} = req.body;
    if((!username)||(!password)||(!email)){return res.status(400).json({error:"All fields required"}) }
    const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email already exists' });
    }
  }


    const salt = await bcrypt.genSalt(7);
    const hased_password = await bcrypt.hash(password,salt);
    const user = new User({
        "username":username,"password":hased_password,"email":email,"roles":"student"
    });
    await user.save();}catch (error) {
  res.status(500).json({ error: 'Server error, please try again later.' });
}

})
export default router;