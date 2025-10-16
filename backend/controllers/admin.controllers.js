import express from "express";
import User from "../model/User.model.js";
import Meal from "../model/Meal.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get single user by ID
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create new user
router.post("/users", async (req, res) => {
    try {
        const { roll,username, email, password, fullName, roles, department, year } = req.body;
        if (!username || !email || !password || !roles) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(409).json({ error: "Username or email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            roll,
            roles,
            department,
            year,
            
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update user
router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        // Delete associated meals
        await Meal.deleteOne({ username: deletedUser.username });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;