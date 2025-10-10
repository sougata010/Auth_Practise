import express from "express";
import dotenv from "dotenv";
import DataBase from "./database/db.js";
import auth from "./utils/middleware.js";
import loginRoute from "./controllers/login.controllers.js";
import registerRoute from "./controllers/register.controllers.js";
import mealRoute from "./controllers/meal.controllers.js"; 
import userDetailsRoute from "./controllers/user_details.controllers.js"; 
import cors from "cors";

dotenv.config();
const app = express();
DataBase();

app.use(cors());
app.use(express.json());

app.use("/auth", loginRoute);
app.use("/auth", registerRoute);

app.use("/user-details", auth, userDetailsRoute); 
app.use("/meal", auth, mealRoute); 

app.listen(process.env.PORT, () => {
  console.log(`The app is listening on port ${process.env.PORT}`);
});