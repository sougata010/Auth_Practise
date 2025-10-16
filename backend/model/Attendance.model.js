import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    fullName:{
        type:String
    },
    status:{
        type:String,
        default:'present'
    },
});
const Attendance=mongoose.model('Attendance',attendanceSchema);
export default Attendance;