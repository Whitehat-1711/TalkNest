import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { chatWithAssistant, getAssistantHistory } from "../controllers/assistant.controller.js";

const router = express.Router();

router.get("/history", protectRoute, getAssistantHistory);
router.post("/chat", protectRoute, chatWithAssistant);

export default router;
