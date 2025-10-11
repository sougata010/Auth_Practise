import express from "express";
import Meal from "../model/Meal.model.js";
import User from "../model/User.model.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const usernameFromToken = req.user.username;
        const user = await User.findOne({usernameFromToken}).select("+fullName");
        const { weekdayDayMain, weekdayNightMain, weekdayNightCarb, sundayDayMain, sundayNightMain } = req.body;
        const mealData = {
            day: weekdayDayMain,
            night1: weekdayNightMain,
            night2: weekdayNightCarb,
            sunday_day: sundayDayMain,
            sunday_night: sundayNightMain,
            fullName:user 

        };

        const updatedMeal = await Meal.findOneAndUpdate(
            { username: usernameFromToken },
            { $set: mealData},
            { 
                new: true,
                upsert: true
            }
        );

        if (!updatedMeal) {
            return res.status(500).json({ error: "Failed to save or update meal plan." });
        }

        res.status(200).json({ message: "Meal plan saved successfully." });
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;