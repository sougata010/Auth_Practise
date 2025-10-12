import express, { response } from "express";
import Meal from "../model/Meal.model.js";
import User from "../model/User.model.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const usernameFromToken = req.user.username;
        const user = await User.findOne({username:usernameFromToken});
        const { weekdayDayMain, weekdayNightMain, weekdayNightCarb, sundayDayMain, sundayNightMain } = req.body;
        const mealData = {
            day: weekdayDayMain,
            night1: weekdayNightMain,
            night2: weekdayNightCarb,
            sunday_day: sundayDayMain,
            sunday_night: sundayNightMain,
            fullName:user.fullName,
            username:usernameFromToken

        };
        const roti_limit=40;
        const veg_limit=30;
        const roti_consumer= await Meal.countDocuments({night2:"roti"});
        const veg_consumer_night=await Meal.countDocuments({night1:"veg"});
        const present_user=await Meal.findOne({username:usernameFromToken});
        if(mealData.night2=="roti"){
            if((roti_consumer>=roti_limit)&&((!present_user) ||(present_user.night2 !="roti"))){
                return res.status(400).json({error:"Max limit reached"})
            }
            
        }
        if(mealData.night1=="veg"){
            if((veg_consumer_night>=veg_limit)&&((!present_user) ||present_user.night1 !="veg")){
                return res.status(400).json({error:"Max limit reached"})
            }
            
        }
            
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