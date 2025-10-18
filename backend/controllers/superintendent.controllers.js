import express from "express";
import Meal from "../model/Meal.model.js";
import dotenv from "dotenv";
import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import Leave from "../model/Leave.model.js";
import Attendance from "../model/Attendance.model.js";
import Updatemeal from "../model/upDatemeal.model.js";


dotenv.config();

const router = express.Router();
function getCurrentTimeString() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

router.get("/", async (req, res) => {
    try {
        const user = await User.find({ roles: 'student' });
        const user_data = await Promise.all(user.map(async (user) => {
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
        res.status(500).json({ error: error })
    }
})

router.delete("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const validuser = await User.findById({ _id: userId });
        const user = await User.deleteOne({ _id: userId });
        await Meal.deleteOne({ username: validuser.username });
        if (user.deletedCount === 0) {
            return res.status(400).json({ error: "Meal deletion unsuccessfull" });
        }
        res.status(201).json({ message: "student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error during deletion." });
    }
})
router.post("/user", async (req, res) => {
    try {
        const { username, roll, department, year, full_name, password, email } = req.body;


        if (!username || !roll || !department || !year || !password || !email || !full_name) {
            return res.status(400).json({ error: "All meal fields and a username are required for creation." });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: `User with ${username} already exists kindly use update` });
        }
        const salt = await bcrypt.genSalt(7)
        const hashedPassword = await bcrypt.hash(password, salt)
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
        const salt = await bcrypt.genSalt(7);
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, salt)
        }
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
router.get("/meal-counts", async (req, res) => {
    try {
        const { mealField } = req.query;
        if (!mealField || !['day', 'night1', 'night2', 'sunday_day', 'sunday_night'].includes(mealField)) {
            return res.status(400).json({ error: "Invalid or missing mealField parameter." });
        }
        const meals = await Meal.find({}).select(`${mealField} username`);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
        const tomorrowDate = new Date(tomorrowDateStr + 'T00:00:00.000Z');
        const counts = {};
        for (const meal of meals) {
            const preference = meal[mealField] || 'Not Set';
            if (!preference || preference === 'Not Set') continue;
            const approvedLeaves = await Leave.find({
                username: meal.username,
                status: 'approved'
            });

            let shouldCountMeal = true;
            let isDayMeal = mealField === 'day' || mealField === 'sunday_day';

            for (const leave of approvedLeaves) {
                const depDate = new Date(leave.departureDate);
                const arrDate = new Date(leave.arrivalDate);
                const depDateOnly = new Date(depDate.toISOString().split('T')[0]);
                const arrDateOnly = new Date(arrDate.toISOString().split('T')[0]);
                if (tomorrowDate >= depDateOnly && tomorrowDate <= arrDateOnly) {
                    if (tomorrowDate.getTime() === depDateOnly.getTime()) {
                        if (isDayMeal) {
                            if (leave.dayMealBefore === false) {
                                shouldCountMeal = false;
                            }
                        } else {
                            if (leave.nightMealBefore === false) {
                                shouldCountMeal = false;
                            }
                        }
                        break;
                    }
                    else if (tomorrowDate.getTime() === arrDateOnly.getTime()) {
                        if (isDayMeal) {
                            if (leave.dayMealAfter === false) {
                                shouldCountMeal = false;
                            }
                        } else {
                            if (leave.nightMealAfter === false) {
                                shouldCountMeal = false;
                            }
                        }
                        break;
                    }
                    else {
                        shouldCountMeal = false;
                        break;
                    }
                }
            }

            if (shouldCountMeal) {
                counts[preference] = (counts[preference] || 0) + 1;
            }
        }

        res.status(200).json({ counts });
    } catch (error) {
        console.error("Error fetching meal counts:", error);
        res.status(500).json({ error: "Internal Server Error during meal counting." });
    }
});
router.get("/leaves", async (req, res) => {
    try {
        const leaves = await Leave.find({ status: "pending" });
        const formattedLeaves = leaves.map(leave => ({
            id: leave._id,
            studentName: leave.fullName,
            from: leave.departureDate,
            to: leave.arrivalDate,
            reason: leave.reason,
            status: leave.status
        }));
        res.status(200).json(formattedLeaves);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/leaves/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const leave = await Leave.findById(id);
    if (!leave) {
        return res.status(400).json({ error: "Leave acceptation unsuccessfull" });

    }
    if (status === "approved" || status === "rejected") {
        leave.status = status;
        await leave.save();
        res.status(201).json({ message: "Leave accepted successfully" });
    } else {
        res.status(400).json({ error: 'Leave request unsuccessfull' });

    }
});
router.get('/student-attendance', async (req, res) => {
    try {
        const now = new Date();
        const currentDateStr = now.toISOString().split('T')[0];
        const currentTime = getCurrentTimeString();

        const students = await User.find({ roles: 'student' }).select('username fullName');

        const statusUpdatePromises = students.map(async (user) => {
            const activeLeaves = await Leave.find({
                username: user.username,
                status: 'approved'
            });

            let finalStatus = 'present';

            for (const leave of activeLeaves) {
                const depDate = new Date(leave.departureDate);
                const arrDate = new Date(leave.arrivalDate);
                const depDateOnly = new Date(depDate.toISOString().split('T')[0]);
                const arrDateOnly = new Date(arrDate.toISOString().split('T')[0]);
                const currentDate = new Date(currentDateStr + 'T00:00:00.000Z');

                if (currentDate >= depDateOnly && currentDate <= arrDateOnly) {

                    if (currentDate.getTime() === depDateOnly.getTime()) {
                        const depTime = depDate.toISOString().split('T')[1].substring(0, 5);
                        if (currentTime >= depTime) {
                            finalStatus = 'absent';
                            break;
                        }
                    }

                    else if (currentDate.getTime() === arrDateOnly.getTime()) {
                        const arrTime = arrDate.toISOString().split('T')[1].substring(0, 5);
                        if (currentTime < arrTime) {
                            finalStatus = 'absent';
                        } else {
                            finalStatus = 'present';
                        }
                        break;
                    }

                    else {
                        finalStatus = 'absent';
                        break;
                    }
                }
            }

            await Attendance.findOneAndUpdate(
                { username: user.username },
                {
                    status: finalStatus,
                    fullName: user.fullName,
                    username: user.username
                },
                { new: true, upsert: true }
            );
        });

        await Promise.all(statusUpdatePromises);

        const finalAttendance = await Attendance.find({});
        res.status(200).json(finalAttendance);

    } catch (error) {
        console.error("Master Attendance Error:", error);
        res.status(500).json({ error: 'Internal Server Error during attendance fetch.' });
    }
});

router.post("/attendance", async (req, res) => {
    try {
        const students = await Attendance.find({})
        res.status(200).json({ username: students.username, fullName: students.fullName, status: students.status });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/meal-request", async (req, res) => {
    const mealUpdate = await Updatemeal.find({ status: 'pending' });
    res.status(200).json({ mealUpdate })
});
router.put("/meal-request/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatemeal = await Updatemeal.findById(id);
    const newmeal = {
        username: updatemeal.username,
        fullName: updatemeal.fullName,
        day: updatemeal.day,
        night1: updatemeal.night1,
        night2: updatemeal.night2,
        sunday_day: updatemeal.sunday_day,
        sunday_night: updatemeal.sunday_night,
    }
    if (!updatemeal) {
        return res.status(400).json({ error: "Meal change unsuccessfull" });

    }
    if (status === "approved" || status === "rejected") {
        if (status === "approved") {
            await Meal.findOneAndUpdate({ username: updatemeal.username }, { $set: newmeal }, { new: true, upsert: true });
        }
        updatemeal.status = status;
        await updatemeal.save();
        res.status(201).json({ message: "Leave accepted successfully" });
    } else {
        res.status(400).json({ error: 'Leave request unsuccessfull' });

    }
});


export default router;