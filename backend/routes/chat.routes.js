// routes/chat.route.js
import express from 'express';
import { handleChat } from '../controllers/chat.controller.js';
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Route xử lý chat - yêu cầu xác thực JWT
router.post('/chat', protectRoute, handleChat);

export default router;