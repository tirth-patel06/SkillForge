// server/src/config/passportGithub.ts

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

//console.log("⚠️ GitHub auth temporarily disabled for development");


const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  "http://localhost:8000/api/auth/github/callback";

// IMPORTANT: Do NOT type the callback parameters with strict types.
//            Passport's TypeScript definitions conflict and cause errors.
//            Using 'any' here is the standard fix for TS + passport-github2.
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : undefined;

        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { email }],
        });

        if (!user) {
          user = new User({
            githubId: profile.id,
            email,
            name: profile.displayName || profile.username,
            verified: true,
            role: "STUDENT",
          });
          await user.save();
        } else if (!user.githubId) {
          user.githubId = profile.id;
          await user.save();
        }

        return done(null, user); // <-- red underline FIXED 👍
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;
