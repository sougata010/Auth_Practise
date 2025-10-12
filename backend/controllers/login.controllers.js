import express from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import User from "../model/User.model.js";
import dotenv from "dotenv";

dotenv.config();

const jwt = jsonwebtoken;
const router = express.Router();

function genRefresh(user) {
    const userRoles = user.roles || ["student"];
    return jwt.sign({ username: user.username}, process.env.SECRET_KEY, { expiresIn: "7d" });
}

function genAccess(user) {
    const userRoles = user.roles || ["student"];
    return jwt.sign({ username: user.username, roles: userRoles }, process.env.SECRET_KEY, { expiresIn: "1h" });
}

router.post("/login", async (req, res) => {
    const { username, password, email } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password is required." });
    }
    if (!username && !email) {
        return res.status(400).json({ error: "Username or email is required." });
    }

    try {
        let user;
        
        if (username) {
            user = await User.findOne({ username });
        } else if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const access = genAccess(user);
        const refresh = genRefresh(user);
        
        user.refreshToken = refresh;
        await user.save();

        res.status(200).json({ access, refresh, roles: user.roles});

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error during login." });
    }
});

export default router;