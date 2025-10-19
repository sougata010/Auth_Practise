import mongoose from "mongoose";

const announcementSchema = mongoose.Schema({
    username:{
        type:String,
        default:"Superintendent"
    },
    message:{
        type:"String"
    },
    createdAt:{
        type:Date
    },
    targetDate:{
        type:Date
    }
});
const Announcement = mongoose.model("Announcement",announcementSchema);
export default Announcement;