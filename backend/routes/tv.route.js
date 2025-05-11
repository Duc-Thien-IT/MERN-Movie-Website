import express from "express";
import {
	getSimilarTvs,
	getTrendingTv,
	getTvDetails,
	getTvsByCategory,
	getTvTrailers,
} from "../controllers/tv.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TV
 *   description: API for TV shows
 */

/**
 * @swagger
 * /tv/trending:
 *   get:
 *     summary: Get a random trending TV show
 *     tags: [TV]
 *     responses:
 *       200:
 *         description: A trending TV show
 *       500:
 *         description: Internal Server Error
 */
router.get("/trending", getTrendingTv);

/**
 * @swagger
 * /tv/{id}/trailers:
 *   get:
 *     summary: Get trailers for a TV show
 *     tags: [TV]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the TV show
 *     responses:
 *       200:
 *         description: List of trailers
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/trailers", getTvTrailers);

/**
 * @swagger
 * /tv/{id}/details:
 *   get:
 *     summary: Get details of a TV show
 *     tags: [TV]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the TV show
 *     responses:
 *       200:
 *         description: TV show details
 *       404:
 *         description: TV show not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/details", getTvDetails);

/**
 * @swagger
 * /tv/{id}/similar:
 *   get:
 *     summary: Get similar TV shows
 *     tags: [TV]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the TV show
 *     responses:
 *       200:
 *         description: List of similar TV shows
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id/similar", getSimilarTvs);

/**
 * @swagger
 * /tv/{category}:
 *   get:
 *     summary: Get TV shows by category
 *     tags: [TV]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name (e.g., popular, top_rated, on_the_air)
 *     responses:
 *       200:
 *         description: List of TV shows in the category
 *       500:
 *         description: Internal Server Error
 */
router.get("/:category", getTvsByCategory);

export default router;
