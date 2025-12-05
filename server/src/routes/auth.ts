import { Router } from "express";
import { User } from "../models/User";
import { compareSync } from "bcryptjs";
import { signJwt } from "../utils/createJwt";
const router=Router()

router.post("/login",async(req,res)=>{
 const{email,password}=req.body
  const user=await User.findOne(email).select("passwordHash")||null
 if(!user)
 {
    console.log("Error no user ofunf")
     return(res.status(404).json({message:"No user found"}))
 }

//standard login using jwt creating token with info
///DEMO LOGIN
})