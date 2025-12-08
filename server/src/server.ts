import app from "./app";
import mongoose from "mongoose";
import { seedDemo } from "./utils/seed";
const connectedDb=async()=>{
    try {
    await mongoose.connect("mongodb+srv://admin:aditya123@cluster0.pbdlbep.mongodb.net/hustleHaveli2")
   const connection=mongoose.connection
   connection.on('connected',()=>{console.log("connection successfull")})
   connection.on('error',()=>{console.log("connection failed some error")
   })
    } catch (error) {
        console.log("error in databse conenctetion occured")
        console.log(error);
    }
    console.log("hit")
}
const startServer = async ()=> {
    await connectedDb();
    console.log("DB connected")
    await seedDemo()
    console.log("Seeded the DB")
}
startServer();
app.listen(8000, ()=>console.log(`server on 8000`));
