import mongoose from "mongoose";

const attendancetotalSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    fullName:{
        type:String
    },
    present:{
        type:Number,
        default:0
    },
    absent:{
        type:Number,
        default:0
    },
    totalDays: { 
        type: Number, 
        default: 0
    },
    lastUpdatedDate: { 
        type: Date 
    }
});
const AttendanceTotal=mongoose.model('AttendanceTotal',attendancetotalSchema);
export default AttendanceTotal;