//  FETCH DATA FROM TMDB API INTO DATABASE FOR REVIEW/RATING FUNCTION
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {connectDB} from './db.js';
import Movie from '../Models/MoviesModel.js';

dotenv.config();

const TMDB_API_KEY = '0b79ae8b3eece41e4dc70ca8341bf347';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables.');
}

const staticGenreMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const mapGenreIdsToObjects = (genreIds) => {
  return genreIds.map(id => ({
    id,
    name: staticGenreMap[id] || 'Unknown'
  }));
};

const fetchMovies = async () => {
  try {
    await connectDB();

    // Define pages 1 to 5
    const pages = [1, 2, 3, 4, 5];
    
    for (const page of pages) {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          page,
        },
      });
      
      const movies = response.data.results;
      
      for (const movieData of movies) {
        const {
          id: tmdbId,
          title,
          original_title: originalTitle,
          overview,
          genre_ids,
          release_date: releaseDate,
          original_language: language,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          popularity,
          vote_average: voteAverage,
          vote_count: voteCount,
          video,
          adult,
        } = movieData;
        
        // Skip if tmdbId is invalid
        if (tmdbId == null || isNaN(Number(tmdbId))) continue;
        
        // Map genre_ids to genre objects
        const genres = genre_ids ? mapGenreIdsToObjects(genre_ids) : [];
        
        // Check if the movie already exists
        const exists = await Movie.findOne({ tmdbId });
        if (!exists) {
          const newMovie = new Movie({
            tmdbId,
            title,
            originalTitle,
            overview,
            genres,
            releaseDate: releaseDate ? new Date(releaseDate) : null,
            runtime: 0, // Default if not provided
            language,
            posterPath,
            backdropPath,
            popularity,
            voteAverage,
            voteCount,
            video,
            adult,
          });
          await newMovie.save();
          console.log(`Saved movie: ${title} (TMDb ID: ${tmdbId})`);
        } else {
          console.log(`Movie already exists: ${title} (TMDb ID: ${tmdbId})`);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching movies:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

fetchMovies();




// DELETE ALL MOVIE IN DATABASE FOR TEST AND CHECK PURPOSE (MAY BE ADD THIS FOR ADMIN FUCTION LATER) 
// const deleteAllMovies = async () => {
//   try {
//     const result = await Movie.deleteMany({});
//     console.log(`${result.deletedCount} movies deleted.`);
//   } catch (error) {
//     console.error('Error deleting movies:', error);
//   }
// };

// // Ensure you are connected to the database before calling the function
// mongoose.connect('mongodb+srv://ngoclequang12345:1234@cluster0.uiu1rep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
//   .then(() => {
//     console.log('Database connected.');
//     deleteAllMovies().then(() => mongoose.disconnect());
//   })
//   .catch(err => console.error('Database connection error:', err));