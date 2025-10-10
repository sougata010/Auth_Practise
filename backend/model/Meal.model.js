import mongoose from "mongoose";

const mealSchema= mongoose.Schema({
    username:{
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
    }
})
const Meal =mongoose.model('Meal',mealSchema);
export default Meal