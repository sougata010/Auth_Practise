import express from "express";
import Meal from "../model/Meal.model.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/",async(req,res)=>{
    try {
        const user=await Meal.find();
        const user_data=user.map((user)=>({
            username:user.username,
            fullName:user.fullName,
            userId:user._id,
            mealPreferences: {
                    day: user.day,
                    night1: user.night1,
                    night2: user.night2,
                    sunday_day: user.sunday_day,
                    sunday_night: user.sunday_night
                }
        }))
        res.json(user_data);
    } catch (error) {
        res.status(500).json({error:error})
    }
})

router.delete("/meal/:userId",async(req,res)=>{
    try {
        const {userId} = req.params
        const meal = await Meal.deleteOne({ _id: userId });
        if(meal.deletedCount === 0){
            return res.status(400).json({error:"Meal deletion unsuccessfull"});
        }
        res.status(201).json({message:"student deleted successfully"});
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error during deletion." });
    }
})
router.post("/meal", async (req, res) => {
    try {
        const { username, day, night1, night2, sunday_day, sunday_night, fullName } = req.body;

        if (!username || !day || !night1 || !night2 || !sunday_day || !sunday_night) {
             return res.status(400).json({ error: "All meal fields and a username are required for creation." });
        }

        const existingMeal = await Meal.findOne({ username });
        if (existingMeal) {
            return res.status(409).json({ error: `Meal preference for user '${username}' already exists. Please use the Edit function (PUT).` });
        }

        const newMeal = new Meal({
            username,
            day,
            night1,
            night2,
            sunday_day,
            sunday_night,
            fullName: fullName || username 
        });

        await newMeal.save();

        res.status(201).json({ 
            message: "Meal plan created successfully.",
            mealId: newMeal._id
        });
        
    } catch (error) {
        console.error("Error creating meal preference:", error);
        res.status(500).json({ error: "Internal Server Error during creation." });
    }
});

router.put("/meal/:userId", async (req, res) => {
    try {
        const { userId } = req.params; 
        
       

        const mealData = {
            day: req.body.day,
            night1: req.body.night1,
            night2: req.body.night2,
            sunday_day: req.body.sunday_day,
            sunday_night: req.body.sunday_night
        };

        const updatedMeal = await Meal.findOneAndUpdate(
            {_id:userId},
            { $set: mealData },
            { new: true, runValidators: true }
        );

        if (!updatedMeal) {
            return res.status(404).json({ error: "Meal preference record not found for the given ID." });
        }

        res.status(200).json({ message: "Meal plan updated successfully." });
        
    } catch (error) {
        console.error("Error updating meal preference:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Internal Server Error during update." });
    }
});





export default router;
