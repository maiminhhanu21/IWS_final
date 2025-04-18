import express from 'express';
import {
  getPopularMovies,
  getMovieById,
  searchMovies,
  createMovieReview,
  getMoviesByGenre,
} from '../Controllers/MoviesController.js';
import {protect,admin} from "../middlewares/Auth.js";

const router = express.Router();

//PUBLIC ROUTES
router.get('/popular', getPopularMovies);
router.get('/search', searchMovies);
router.get('/:id', getMovieById);
router.get('/genre/:genreName', getMoviesByGenre)

//PRIVATE ROUTES
router.post("/:tmdbId/reviews", protect, createMovieReview);
export default router;
