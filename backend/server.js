import express from "express";
import dotenv from "dotenv";
import DataBase from "./database/db.js";
import auth from "./utils/middleware.js";
import loginRoute from "./controllers/login.controllers.js";
import registerRoute from "./controllers/register.controllers.js";
import cors from "cors";

dotenv.config();
const app=express();
DataBase();
app.use(cors());
app.use(express.json());
app.use("/login",loginRoute);
app.use("/register",registerRoute)
app.get("/protected",auth,(req,res)=>{
    res.status(200).json({user:req.user})
})
app.listen(process.env.PORT, () => {
  console.log(`The app is listening on port ${process.env.PORT}`);
});


