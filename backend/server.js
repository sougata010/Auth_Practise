import express from "express";
import dotenv from "dotenv";
import DataBase from "./database/db.js";
import auth from "./utils/middleware.js";
import loginRoute from "./controllers/login.controllers.js";
import registerRoute from "./controllers/register.controllers.js";
import mealRoute from "./controllers/meal.controllers.js"; 
import userDetailsRoute from "./controllers/user_details.controllers.js"; 
import cors from "cors";
import adminRoute from "./controllers/admin.controllers.js"
import superRoute from "./controllers/superintendent.controllers.js"
import superauth from "./utils/supermiddleware.js";
import adminauth from "./utils/adminmiddleware.js";
import leaveRoute from "./controllers/leave.controllers.js";
import logoutRoute from "./controllers/logout.controllers.js";
dotenv.config();
const app = express();
DataBase();

app.use(cors());
app.use(express.json());

app.use("/auth", loginRoute);
app.use("/auth", registerRoute);

app.use("/user-details",auth,userDetailsRoute); 
app.use("/meal", auth, mealRoute); 
app.use("/superintendent",[auth,superauth],superRoute);
app.use("/admin",[auth,adminauth],adminRoute);
app.use("/leave",auth,leaveRoute);
app.use("/logout",logoutRoute)

app.listen(process.env.PORT, () => {
  console.log(`The app is listening on port ${process.env.PORT}`);
});