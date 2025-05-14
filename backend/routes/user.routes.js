import express from "express";
import { updateWatchedHistory, updateSearchHistory, getWatchedHistory } from "../controllers/user.controller.js";

const router = express.Router();

// API để cập nhật lịch sử xem phim
router.post("/:userId/watch-history", updateWatchedHistory);

// API để cập nhật lịch sử tìm kiếm
router.post("/:userId/search-history", updateSearchHistory);

// API để lấy lịch sử xem phim
router.get("/:userId/watch-history", getWatchedHistory);

export default router;