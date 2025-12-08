import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string || "supersecretjwt"
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

const DEFAULT_EXP = "1d";

export function signJwt(payload: any, expiresIn = DEFAULT_EXP) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn:"1d" });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.error("error verifying jwt token");
    console.error(e);
    return null;
  }
}
