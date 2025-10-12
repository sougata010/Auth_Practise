import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function adminauth(req, res, next) {
    const role = req.user.roles;
    if (role === "admin") {
        next();
    } else {
        return res.status(403).json({ error: "You don't have access to this page" });
    }
}
export default adminauth;