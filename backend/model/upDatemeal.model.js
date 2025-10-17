import mongoose from "mongoose";

const updatemealSchema= mongoose.Schema({
    username:{
        type:String
    },
    fullName:{
        type:String
    },
    day:{
        type:String
    },
    night1:{
        type:String
    },
    night2:{
        type:String
    },
    sunday_day:{
        type:String
    },
    sunday_night:{
        type:String
    },
    status:{
        type:String
    }
})
const Updatemeal =mongoose.model('updatemeal',updatemealSchema);
export default Updatemeal