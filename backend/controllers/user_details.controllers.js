import express from "express";
import User from "../model/User.model.js";
import Meal from "../model/Meal.model.js"; 
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

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

export default router;