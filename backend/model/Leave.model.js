import mongoose from "mongoose";

const leaveSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    departureDate:{
        type: String,
        required: true
    },
    arrivalDate:{
        type: String,
        required: true
    },
    departureTime:{
        type: String,
        required: true
    },
    arrivalTime:{
        type: String,
        required: true
    },
    dayMealBefore:{
        type:Boolean,
        required:true
    },
    nightMealBefore:{
        type:Boolean,
        required:true
    },
    dayMealAfter:{
        type:Boolean,
        required:true
    },
    nightMealAfter:{
        type:Boolean,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum: ['pending', 'approved', 'rejected'] 
    },
    reason:{
        type:String
    }

})

const Leave =mongoose.model("Leave",leaveSchema);
export default Leave;