import express from "express";
import User from "../model/User.model.js";
import Meal from "../model/Meal.model.js"; 
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import AttendanceTotal from "../model/AttendanceTotal.model.js";
import Attendance from "../model/Attendance.model.js";
import Announcement from "../model/Announcements.model.js";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Authorization header missing or malformed." });
        }
        
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        const usernameFromToken = decoded.username; 
        const user = await User.findOne({ username: usernameFromToken }).select('username fullName roll department year'); 
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const meal = await Meal.findOne({ username: usernameFromToken }).select('day night1 night2 sunday_day sunday_night');

        res.status(200).json({ 
            username: user.username,
            fullName:user.fullName,
            roll:user.roll,
            department:user.department,
            year:user.year,
            mealPreferences: meal 
        });

    } catch (error) {
        if (error instanceof jsonwebtoken.JsonWebTokenError) {
            return res.status(403).json({ error: "Invalid or expired access token." });
        }
        res.status(500).json({ error: "Internal server error." });
    }
});
router.get("/totalattendance",async(req,res)=>{
    try {
        const user = req.user.username;
        const status = await AttendanceTotal.findOne({username:user});
        if(!status){
            return res.status(400).json({error:"No record found"});
        }
        res.status(200).json({status})
    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
    
});
router.get("/announcement",async(req,res)=>{
    try {
        const fetchannouncement = await Announcement.find().sort({ createdAt: -1 });;
        res.status(200).json({fetchannouncement});
    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
})


export default router;