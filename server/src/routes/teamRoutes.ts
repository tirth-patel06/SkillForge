// server/src/routes/teamRoutes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth"; // adjust path if your auth middleware file name is different
import {
  getMyTeams,
  createTeam,
  joinTeam,
  getTeamById,
  updateTeam,
  kickMember,
  transferLeadership,
  leaveTeam,
} from "../controllers/teamController";
import { regenerateInviteCode } from "../controllers/teamController";
const router = Router();

// all team routes require auth
router.use(requireAuth);
router.post("/:teamId/regenerate-invite", regenerateInviteCode);

router.get("/my", getMyTeams);
router.post("/", createTeam);
router.post("/join", joinTeam);
router.get("/:teamId", getTeamById);
router.patch("/:teamId", updateTeam);
router.post("/:teamId/kick", kickMember);
router.post("/:teamId/transfer", transferLeadership);
router.post("/:teamId/leave", leaveTeam);

export default router;
