import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Movie from '../Models/MoviesModel.js';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '0b79ae8b3eece41e4dc70ca8341bf347';


if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables.');
}


// @desc    Fetch popular movies
// @route   GET /api/movies/popular
// @access  Public
const getPopularMovies = asyncHandler(async (req, res) => {
 
  try {
    const pages = [1, 2, 3, 4, 5];
     // Map over the pages and create a promise for each API call
     const requests = pages.map(page =>
      axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
        },
      })
    );
    
    // Wait for all API calls to complete
    const responses = await Promise.all(requests);
    
    // Combine the results from each page into one array
    let combinedResults = [];
    responses.forEach(response => {
      combinedResults = combinedResults.concat(response.data.results);
    });
  
    res.json({
      page:[1, 2, 3, 4, 5] ,
      results: combinedResults,
      total_pages: responses[0].data.total_pages,
      total_results: responses[0].data.total_results,
    });
  } catch (error) {
    console.error('Error fetching popular movies:', error.message);
    res.status(500).json({
      message: 'Failed to fetch popular movies',
      error: error.message,
    });
  }
});

// @desc    Fetch movie details by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400);
    throw new Error('Movie ID is required.');
  }
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).json({
      message: 'Failed to fetch movie details',
      error: error.message,
    });
  }
});

// @desc    Search movies by title
// @route   GET /api/movies/search
// @access  Public
const searchMovies = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ message: 'Query parameter is required for searching movies.' });
    return;
  }
  
  try {
    // Fetch the first page to determine total results and total pages
    const firstResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: 'en-US',
        include_adult: false,
        page: 1,
      },
    });
    
    // Determine the total pages, but limit fetching to the first 5 pages
    const totalPages = firstResponse.data.total_pages;
    const pagesToFetch = Math.min(totalPages, 5);
    
    // Start with the results from page 1
    let allResults = firstResponse.data.results;
    
    // If more than one page is available and needed, fetch them concurrently
    if (pagesToFetch > 1) {
      const pagePromises = [];
      for (let page = 2; page <= pagesToFetch; page++) {
        pagePromises.push(
          axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
              api_key: TMDB_API_KEY,
              query,
              language: 'en-US',
              include_adult: false,
              page,
            },
          })
        );
      }
      
      const responses = await Promise.all(pagePromises);
      responses.forEach(response => {
        allResults = allResults.concat(response.data.results);
      });
    }
    
    if (allResults.length === 0) {
      res.status(404).json({ message: 'No movies found matching your query.' });
      return;
    }
    
    res.json({
      results: allResults,
      total_results: firstResponse.data.total_results,
      total_pages: firstResponse.data.total_pages,
    });
  } catch (error) {
    console.error('Error searching movies:', error.message);
    res.status(500).json({
      message: 'Failed to search movies',
      error: error.message,
    });
  }
});

//PRIVATE CONTROLLER
// @desc  Create movie review
// @route  POST /api/movies/:id/reviews
// @access  Private
const createMovieReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { tmdbId } = req.params;

  // Validate tmdbId
  if (!tmdbId || isNaN(Number(tmdbId))) {
    return res.status(400).json({ message: 'Invalid tmdbId provided' });
  }

  const numericTmdbId = Number(tmdbId);

  try {
    // Find the movie by tmdbId
    const movie = await Movie.findOne({ tmdbId: numericTmdbId });

    if (movie) {
      // Check if the user has already reviewed the movie
      const alreadyReviewed = movie.reviews.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this movie');
      }

      // Create a new review object
      const review = {
        userName: req.user.fullName,
        userId: req.user._id,
        userImage: req.user.image,
        rating: Number(rating),
        comment,
      };

      // Add the review to the movie's reviews array
      movie.reviews.push(review);

      // Update the number of reviews
      movie.voteCount +=1;

      // Calculate the new average rating
      movie.voteAverage =
      (movie.voteAverage * (movie.voteCount - 1) + Number(rating)) /movie.voteCount;

      await movie.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404);
      throw new Error('Movie not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get movies by genre name
// @route   GET /api/movies/genre/:genreName
// @access  Public
const getMoviesByGenre = asyncHandler(async (req, res) => {
  const { genreName } = req.params;
  if (!genreName) {
    res.status(400);
    throw new Error('Genre name is required');
  }

  try {
    // Query movies where any genre's name matches the provided genreName (case-insensitive)
    const movies = await Movie.find({
      "genres.name": { $regex: new RegExp(`^${genreName}$`, 'i') }
    }).sort({ voteAverage: -1 });

    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies by genre:', error.message);
    res.status(500).json({
      message: 'Failed to fetch movies by genre',
      error: error.message,
    });
  }
});



export { getPopularMovies, getMovieById, searchMovies, createMovieReview, getMoviesByGenre};
