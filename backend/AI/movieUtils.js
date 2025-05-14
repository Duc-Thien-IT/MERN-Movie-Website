import { fetchFromTMDB } from "../services/tmdb.service.js";

// Số lượng trang phim cần lấy từ API
const PAGES_TO_FETCH = 3;

// Map thể loại phim phổ biến
const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

// Danh sách thể loại để sử dụng trong vector đặc trưng
const SELECTED_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Romance", "Science Fiction", "Thriller"
];

// Lấy danh sách phim từ API TMDB
export const getAllMovies = async () => {
  try {
    const movies = [];
    
    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const popularMovies = await fetchMoviesByType('popular', page);
      const topRatedMovies = await fetchMoviesByType('top_rated', page);
      
      movies.push(...popularMovies, ...topRatedMovies);
    }

    const uniqueMovies = filterDuplicateMovies(movies);
    console.log(`✅ Fetched ${uniqueMovies.length} unique movies`);

    return uniqueMovies;
  } catch (error) {
    console.error("❌ Error fetching TMDB movies:", error.message);
    return [];
  }
};

// Lấy phim theo loại (popular, top_rated, etc.)
const fetchMoviesByType = async (type, page = 1) => {
  try {
    const url = `https://api.themoviedb.org/3/movie/${type}?language=en-US&page=${page}`;
    const data = await fetchFromTMDB(url);
    return data.results || [];
  } catch (error) {
    console.error(`❌ Error fetching ${type} movies page ${page}:`, error.message);
    return [];
  }
};

// Lọc bỏ phim trùng lặp
const filterDuplicateMovies = (movies) => {
  const uniqueIds = new Set();
  return movies.filter(movie => {
    if (uniqueIds.has(movie.id)) return false;
    uniqueIds.add(movie.id);
    return true;
  });
};

// Xây dựng vector đặc trưng cho phim
export const buildMovieFeatureVectors = (movies) => {
  return movies.map(movie => {
    const genreNames = (movie.genre_ids || [])
      .map(id => genreMap[id])
      .filter(Boolean);

    const genreVector = SELECTED_GENRES.map(genre => 
      genreNames.includes(genre) ? 1 : 0
    );

    const popularityScore = movie.popularity ? Math.min(movie.popularity / 1000, 1) : 0;
    const ratingScore = movie.vote_average ? movie.vote_average / 10 : 0;
    const voteCountScore = movie.vote_count ? Math.min(movie.vote_count / 10000, 1) : 0;

    const combinedFeatures = [
      ...genreVector,
      popularityScore,
      ratingScore,
      voteCountScore
    ];

    return {
      id: movie.id.toString(),
      title: movie.title,
      features: combinedFeatures,
      raw: movie,
    };
  });
};

// Lấy thông tin chi tiết của một phim
export const getMovieDetails = async (movieId) => {
  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
    const data = await fetchFromTMDB(url);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching movie details for ID ${movieId}:`, error.message);
    return null;
  }
};
