// controllers/chat.controller.js
import axios from 'axios';
import { ENV_VARS } from "../config/envVars.js";

// Hàm chính xử lý chat
export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Kiểm tra input hợp lệ
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid messages format' 
      });
    }

    // Kiểm tra nội dung tin nhắn gần nhất có liên quan đến phim không
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    const isMovieRelated = checkIfMovieRelated(lastMessage);
    
    // Thử gọi OpenAI API hoặc sử dụng fallback
    let reply;
    let movieData = null;
    
    try {
      // Gọi OpenAI API để xử lý tin nhắn
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'Bạn là trợ lý Netflix, giúp người dùng tìm kiếm và gợi ý phim. Trả lời ngắn gọn và thân thiện.'
            },
            ...messages
          ],
          max_tokens: 250,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${ENV_VARS.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      reply = response.data.choices[0].message.content;
    } catch (apiError) {
      console.warn('OpenAI API error:', apiError.message);
      
      // Sử dụng phản hồi dự phòng nếu OpenAI API không khả dụng
      reply = generateFallbackResponse(lastMessage);
    }

    // Nếu tin nhắn liên quan đến phim, và có API TMDB, tìm kiếm phim
    if (isMovieRelated && ENV_VARS.TMDB_API_KEY) {
      movieData = await searchMovies(lastMessage);
    }

    return res.json({
      success: true,
      reply,
      movieData
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Hàm tạo phản hồi dự phòng khi OpenAI API không khả dụng
function generateFallbackResponse(message) {
  const movieKeywords = {
    'phim hành động': 'Một số phim hành động nổi tiếng trên Netflix bao gồm Extraction, The Old Guard, và 6 Underground.',
    'phim kinh dị': 'Một số phim kinh dị hay trên Netflix là The Haunting of Hill House, Bird Box, và The Ritual.',
    'phim tình cảm': 'Bạn có thể thích các phim tình cảm như To All the Boys I\'ve Loved Before, Always Be My Maybe, hoặc Set It Up.',
    'phim hài': 'Một số phim hài được yêu thích trên Netflix bao gồm Murder Mystery, The Wrong Missy, và Eurovision Song Contest.',
    'phim khoa học viễn tưởng': 'The Platform, Black Mirror, và Altered Carbon là những lựa chọn khoa học viễn tưởng tuyệt vời trên Netflix.'
  };

  // Kiểm tra từ khóa trong tin nhắn
  for (const [keyword, response] of Object.entries(movieKeywords)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  // Phản hồi mặc định nếu không tìm thấy từ khóa
  return 'Tôi có thể gợi ý các bộ phim hay trên Netflix. Bạn thích thể loại gì? Hành động, kinh dị, tình cảm, hài, hay khoa học viễn tưởng?';
}

// Hàm kiểm tra nếu tin nhắn liên quan đến phim
function checkIfMovieRelated(message) {
  const movieKeywords = [
    'phim', 'movie', 'film', 'xem gì', 'netflix', 'hành động', 'kinh dị', 
    'tình cảm', 'hài', 'khoa học viễn tưởng', 'sci-fi', 'action', 'comedy',
    'drama', 'horror', 'đề xuất', 'recommend', 'suggestion', 'watch'
  ];
  
  return movieKeywords.some(keyword => message.includes(keyword));
}

// Hàm tìm kiếm phim từ TMDB API
async function searchMovies(query) {
  try {
    // Phân tích query để xác định loại phim
    let endpoint = '/search/movie';
    let params = { query: extractMovieQuery(query) };
    
    // Xử lý tìm kiếm theo thể loại
    const genreMatch = query.match(/thể loại|genre|loại phim/i);
    if (genreMatch) {
      const genres = await getGenres();
      const matchedGenre = findMatchingGenre(query, genres);
      
      if (matchedGenre) {
        endpoint = '/discover/movie';
        params = { with_genres: matchedGenre.id };
      }
    }
    
    const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
      params: {
        api_key: ENV_VARS.TMDB_API_KEY,
        language: 'vi-VN', // Hoặc 'en-US' tùy ngôn ngữ ứng dụng
        ...params
      }
    });
    
    // Giới hạn kết quả để tránh quá nhiều dữ liệu
    return response.data.results.slice(0, 3);
  } catch (error) {
    console.error('Error searching movies:', error);
    return null;
  }
}

// Lấy danh sách thể loại phim từ TMDB
async function getGenres() {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
      params: {
        api_key: ENV_VARS.TMDB_API_KEY,
        language: 'vi-VN'
      }
    });
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Tìm thể loại phim phù hợp với yêu cầu
function findMatchingGenre(query, genres) {
  // Map thể loại tiếng Việt sang tiếng Anh
  const genreMapping = {
    'hành động': 'action',
    'phiêu lưu': 'adventure',
    'hoạt hình': 'animation',
    'hài': 'comedy',
    'tội phạm': 'crime',
    'tài liệu': 'documentary',
    'chính kịch': 'drama',
    'gia đình': 'family',
    'giả tưởng': 'fantasy',
    'lịch sử': 'history',
    'kinh dị': 'horror',
    'nhạc': 'music',
    'bí ẩn': 'mystery',
    'tình cảm': 'romance',
    'khoa học viễn tưởng': 'science fiction',
    'ti vi': 'tv movie',
    'gây cấn': 'thriller',
    'chiến tranh': 'war',
    'cao bồi': 'western'
  };
  
  const queryLower = query.toLowerCase();
  
  // Kiểm tra từng thể loại trong genreMapping
  for (const [viGenre, enGenre] of Object.entries(genreMapping)) {
    if (queryLower.includes(viGenre) || queryLower.includes(enGenre)) {
      return genres.find(g => 
        g.name.toLowerCase() === enGenre || 
        g.name.toLowerCase() === viGenre
      );
    }
  }
  
  // Kiểm tra trực tiếp với danh sách từ TMDB
  return genres.find(genre => 
    queryLower.includes(genre.name.toLowerCase())
  );
}

// Trích xuất từ khóa tìm kiếm phim từ câu hỏi
function extractMovieQuery(message) {
  // Loại bỏ các từ khóa không cần thiết
  const cleanedMessage = message
    .replace(/phim|movie|film|gợi ý|đề xuất|recommend|suggestion|xem gì|netflix/gi, '')
    .trim();
    
  // Nếu tin nhắn quá ngắn sau khi lọc, lấy từ khóa cuối cùng
  if (cleanedMessage.length < 3) {
    const words = message.split(' ');
    return words[words.length - 1];
  }
  
  return cleanedMessage;
}