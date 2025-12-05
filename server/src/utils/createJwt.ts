
import jwt from "jsonwebtoken";
const JWT_SECRET=process.env.JWT_SECRET as string
export function signJwt(payload: any, expiresIn = "1d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }) ;
}
//error encountered in expires in(version issuee???)
export function verifyJwt(token: string) {
  try { return jwt.verify(token, JWT_SECRET); } catch(e){
     console.log("error in generating jwt token occured")
     console.log(e)
     return null
  }
}
