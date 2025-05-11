import express from "express";
import {
	getSearchHistory,
	removeItemFromSearchHistory,
	searchMovie,
	searchPerson,
	searchTv,
} from "../controllers/search.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search for movies, TV shows, people and manage search history
 */

/**
 * @swagger
 * /search/person/{query}:
 *   get:
 *     summary: Search for a person
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the person to search for
 *     responses:
 *       200:
 *         description: List of matching people
 *       404:
 *         description: No results found
 *       500:
 *         description: Internal Server Error
 */
router.get("/person/:query", searchPerson);

/**
 * @swagger
 * /search/movie/{query}:
 *   get:
 *     summary: Search for a movie
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Title of the movie to search for
 *     responses:
 *       200:
 *         description: List of matching movies
 *       404:
 *         description: No results found
 *       500:
 *         description: Internal Server Error
 */
router.get("/movie/:query", searchMovie);

/**
 * @swagger
 * /search/tv/{query}:
 *   get:
 *     summary: Search for a TV show
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Title of the TV show to search for
 *     responses:
 *       200:
 *         description: List of matching TV shows
 *       404:
 *         description: No results found
 *       500:
 *         description: Internal Server Error
 */
router.get("/tv/:query", searchTv);

/**
 * @swagger
 * /search/history:
 *   get:
 *     summary: Get search history of the user
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search history
 *       500:
 *         description: Internal Server Error
 */
router.get("/history", getSearchHistory);

/**
 * @swagger
 * /search/history/{id}:
 *   delete:
 *     summary: Remove an item from search history
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the item to remove from search history
 *     responses:
 *       200:
 *         description: Item removed from search history
 *       500:
 *         description: Internal Server Error
 */
router.delete("/history/:id", removeItemFromSearchHistory);

export default router;
