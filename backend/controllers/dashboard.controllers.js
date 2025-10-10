import express from "express";
import User from "../model/User.model.js";
import Meal from "../model/Meal.model.js"; 
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const usernameFromToken = req.user.username; 
        
        const user = await User.findOne({ username: usernameFromToken }).select('username'); 

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        
        const meal = await Meal.findOne({ username: usernameFromToken }).select('day night1 night2 sunday_day sunday_night');

        res.status(200).json({ 
            username: user.username,
            mealPreferences: meal 
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;