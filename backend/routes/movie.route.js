import express from "express";
import {
	getMovieDetails,
	getMoviesByCategory,
	getMovieTrailers,
	getSimilarMovies,
	getTrendingMovie,
} from "../controllers/movie.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie-related endpoints
 */

/**
 * @swagger
 * /movie/trending:
 *   get:
 *     summary: Get trending movies of the day
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: A trending movie
 *       500:
 *         description: Internal Server Error
 */
router.get("/trending", getTrendingMovie);

/**
 * @swagger
 * /movie/{id}/trailers:
 *   get:
 *     summary: Get trailers for a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: List of trailers
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/trailers", getMovieTrailers);

/**
 * @swagger
 * /movie/{id}/details:
 *   get:
 *     summary: Get details of a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie details
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/details", getMovieDetails);

/**
 * @swagger
 * /movie/{id}/similar:
 *   get:
 *     summary: Get similar movies
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: List of similar movies
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/similar", getSimilarMovies);

/**
 * @swagger
 * /movie/{category}:
 *   get:
 *     summary: Get movies by category (e.g., popular, top_rated, upcoming)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [popular, top_rated, upcoming, now_playing]
 *         description: The category of movies
 *     responses:
 *       200:
 *         description: Movies by category
 *       500:
 *         description: Internal Server Error
 */
router.get("/:category", getMoviesByCategory);

export default router;
