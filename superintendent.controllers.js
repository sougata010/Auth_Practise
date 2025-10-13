import express from "express";
import Meal from "../model/Meal.model.js";
import dotenv from "dotenv";
import User from "../model/User.model.js";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();

router.get("/",async(req,res)=>{
    try {
        const user=await User.find({ roles: 'student'});
        const user_data=await Promise.all(user.map(async(user)=>{
            const meal = await Meal.findOne({ username: user.username });
           return {
                userId: user._id,
                username: user.username,
                fullName: user.fullName, 
                email: user.email,
                roll: user.roll,
                department: user.department,
                year: user.year,
                mealPreferences: meal ? {
                    day: meal.day,
                    night1: meal.night1,
                    night2: meal.night2,
                    sunday_day: meal.sunday_day,
                    sunday_night: meal.sunday_night
                } : null
            }
        }))
       res.json({ users: user_data, superintendent_name: req.user.username });
    } catch (error) {
        res.status(500).json({error:error})
    }
})

router.delete("/user/:userId",async(req,res)=>{
    try {
        const {userId} = req.params
        const validuser = await User.findById({_id:userId});
        const user = await User.deleteOne({ _id: userId });
        await Meal.deleteOne({username: validuser.username});
        if(user.deletedCount === 0){
            return res.status(400).json({error:"Meal deletion unsuccessfull"});
        }
        res.status(201).json({message:"student deleted successfully"});
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error during deletion." });
    }
})
router.post("/user", async (req, res) => {
    try {
        const { username, roll, department, year, full_name,password,email } = req.body;
        

        if (!username || !roll || !department || !year || !password || !email || !full_name) {
             return res.status(400).json({ error: "All meal fields and a username are required for creation." });
        }
        const existingUser =await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error:`User with ${username} already exists kindly use update`});
        }
        const salt =await bcrypt.genSalt(7)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName: full_name,
            roll,
            department,
            year,
            roles: 'student'
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", userId: newUser._id });
        
    } catch (error) {
        console.error("Error creating meal preference:", error);
        res.status(500).json({ error: "Internal Server Error during creation." });
    }
});

router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, {
            fullName: updateData.full_name,
            roll: updateData.roll,
            department: updateData.department,
            year: updateData.year,
            ...(updateData.password && { password: updateData.password })
        }, { new: true });
        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});




export default router;