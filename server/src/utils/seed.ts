// src/utils/seed.ts
/*import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { Referral } from "../models/Referral";
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
 const student = await User.findOneAndUpdate(
    { email: "student@college.edu" },
    { name: "student One", role: "STUDENT", verified: true },
    { upsert: true, new: true }
  );

    // referrals data
    const referralsData = Array.from({ length: 5 }).map((_, i) => ({
      studentId: student._id,
      mentorId: mentor1._id,
      recommendation: `This student performed excellently in project #${i + 1}.`,
      evidenceLinks: [
        `http://evidence.com/project_${i + 1}`,
        `http://github.com/student/project_${i + 1}`,
      ],
      status: "PENDING",
      signedToken: undefined, // explicitly empty
      pdfUrl: undefined, // explicitly empty
    }));
     await Referral.insertMany(referralsData);
  console.log("Seeded referrals also")
  console.log("Seed completed");
}
*/
