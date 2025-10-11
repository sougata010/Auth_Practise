import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:true,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    },
    roles:{
        type:String
    }
})

const User =mongoose.model('User',userSchema);

export default User

