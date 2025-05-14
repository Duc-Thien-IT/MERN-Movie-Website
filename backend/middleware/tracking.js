import { User } from "../models/user.model.js";

/**
 * Middleware để tự động cập nhật lịch sử xem phim khi người dùng truy cập vào trang chi tiết phim
 * Được áp dụng cho route GET /api/v1/movie/:id
 */
export const trackMovieView = async (req, res, next) => {
  try {
    // Chỉ theo dõi cho method GET
    if (req.method !== 'GET') {
      return next();
    }

    const userId = req.user?._id;
    const movieId = req.params.id;

    // Nếu không có userId hoặc movieId thì bỏ qua
    if (!userId || !movieId) {
      return next();
    }

    // Cập nhật lịch sử xem phim cho người dùng
    // Sử dụng $addToSet để tránh lưu trùng lặp
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchedHistory: movieId } },
      { new: true }
    );

    console.log(`✅ User ${userId} watched movie ${movieId} - history updated`);
    
    // Tiếp tục xử lý request
    next();
  } catch (error) {
    console.error("❌ Error tracking movie view:", error);
    // Không trả về lỗi để không ảnh hưởng đến trải nghiệm người dùng
    next();
  }
};

/**
 * Middleware để tự động cập nhật lịch sử tìm kiếm khi người dùng thực hiện tìm kiếm
 * Được áp dụng cho route GET /api/v1/search
 */
export const trackSearchQuery = async (req, res, next) => {
  try {
    // Chỉ theo dõi cho method GET
    if (req.method !== 'GET') {
      return next();
    }

    const userId = req.user?._id;
    const query = req.query.q || req.query.query;

    // Nếu không có userId hoặc query thì bỏ qua
    if (!userId || !query || query.trim() === '') {
      return next();
    }

    // Cập nhật lịch sử tìm kiếm cho người dùng
    // Sử dụng $push để lưu theo thứ tự thời gian và giới hạn 20 lịch sử gần nhất
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          searchHistory: { 
            $each: [query],
            $position: 0,
            $slice: 20
          } 
        } 
      },
      { new: true }
    );

    console.log(`✅ User ${userId} searched for "${query}" - history updated`);
    
    // Tiếp tục xử lý request
    next();
  } catch (error) {
    console.error("❌ Error tracking search query:", error);
    // Không trả về lỗi để không ảnh hưởng đến trải nghiệm người dùng
    next();
  }
};