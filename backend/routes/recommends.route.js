import express from "express";
import { recommendMovies, trainModel, getModelInfo, initializeMovieData } from "../AI/recommender.js";

const router = express.Router();

// API để huấn luyện mô hình
router.post("/train", async (req, res) => {
  try {
    const { force } = req.query;
    const result = await trainModel(force === 'true');
    res.json({ 
      message: "Model training completed", 
      result 
    });
  } catch (error) {
    console.error("❌ Error training model:", error);
    res.status(500).json({ error: "Model training failed", message: error.message });
  }
});

// API để khởi tạo cache dữ liệu phim
router.post("/initialize", async (req, res) => {
  try {
    const movies = await initializeMovieData();
    res.json({ 
      message: "Movie data initialized", 
      count: movies.length 
    });
  } catch (error) {
    console.error("❌ Error initializing movie data:", error);
    res.status(500).json({ error: "Initialization failed", message: error.message });
  }
});

// API để lấy thông tin về trạng thái mô hình
router.get("/status", (req, res) => {
  const info = getModelInfo();
  res.json(info);
});

// API để lấy đề xuất phim cho người dùng
router.get("/recommend/:userId", async (req, res) => {
  try {
    const result = await recommendMovies(req.params.userId);
    res.json({
      recommendations: result,
      count: result.length
    });
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    res.status(500).json({ error: "Recommendation failed", message: error.message });
  }
});

export default router;