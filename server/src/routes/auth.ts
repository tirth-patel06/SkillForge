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
 if (!compareSync(password, user.passwordHash || "")) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    if (user.banned) {
      return res.status(402).json({ message: "Account is banned" });
    }
    const token=signJwt({
         "user_id":user._id,
         "role":user.role
    })
    console.log(token)
      res.json({ token, user: { id: user._id, email: user.email, role: user.role },status:200,message:"Login successfull"});
})
//standard login using jwt creating token with info
///DEMO LOGIN
export default router;