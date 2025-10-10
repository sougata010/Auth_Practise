import mongoose from "mongoose";

async function DataBase(){
await mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Successfully connected to DB")
}).catch((err)=>{
    console.log(err)
})};

export default DataBase;