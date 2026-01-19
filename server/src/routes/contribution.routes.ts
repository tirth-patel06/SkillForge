import { Router } from "express";
import { history, heatmap, badges, stats } from "../controllers/contribution.controller";
import { authMiddleware } from "../middleware/auth";
import { score } from "../controllers/contribution.controller";

const router = Router();

router.get("/history", authMiddleware   , history);
router.get("/heatmap", authMiddleware, heatmap);
router.get("/badges", authMiddleware, badges);
router.get("/score", authMiddleware, score);
router.get("/stats", authMiddleware, stats);
export default router;
