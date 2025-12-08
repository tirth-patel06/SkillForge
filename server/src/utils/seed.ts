// src/utils/seed.ts
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Task } from "../models/Task";

export async function seedDemo() {

 const mentor1 = await User.findOneAndUpdate(
    { email: "mentor1@college.edu" },
    { name: "Mentor One", role: "MENTOR", verified: true },
    { upsert: true, new: true }
  );
  for (let i = 1; i <= 5; i++) {
    await Task.create({
      title: `Task ${i} from ${mentor1.email}`,
      description: `Build feature ${i} for training`,
      difficulty: "MEDIUM",
      techStack: ["React","Node"],
      expectedTeamSize: 3,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      createdBy: mentor1._id,
      status: "PENDING"
    });
  }

  console.log("Seed completed");
}

