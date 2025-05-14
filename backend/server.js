import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import tvRoutes from "./routes/tv.route.js";
import searchRoutes from "./routes/search.route.js";
import chatRoutes from "./routes/chat.routes.js"; 
import recommendRoutes from "./routes/recommends.route.js";
import userRoutes from "./routes/user.routes.js";
import { initializeMovieData } from "./AI/recommender.js";

import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { protectRoute } from "./middleware/protectRoute.js";

import setupSwagger from "./config/swagger.js";

const app = express();

const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);
app.use("/api/v1", chatRoutes); 
app.use("/api/v1/recommend", protectRoute, recommendRoutes);
app.use("/api/v1/users", protectRoute, userRoutes);

if (ENV_VARS.NODE_ENV !== "production") {
	setupSwagger(app);
}

if (ENV_VARS.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT,async () => {
	console.log("Server started at http://localhost:" + PORT);
	connectDB();
	try {
		await initializeMovieData();
		console.log("✅ Movie data initialized on startup");
	} catch (error) {
		console.error("❌ Failed to initialize movie data:", error);
	}
});