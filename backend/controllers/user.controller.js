import { User } from "../models/user.model.js";

// Cập nhật lịch sử xem phim của người dùng
export const updateWatchedHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "MovieId is required" });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra nếu movieId đã tồn tại trong lịch sử
    if (!user.watchedHistory.includes(movieId)) {
      // Thêm movieId vào lịch sử xem
      await User.findByIdAndUpdate(
        userId,
        { $push: { watchedHistory: movieId } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Watch history updated successfully" });
  } catch (error) {
    console.error("❌ Error updating watch history:", error.message);
    res.status(500).json({ message: "Failed to update watch history" });
  }
};

// Thêm phim vào lịch sử tìm kiếm
export const updateSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { searchQuery } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Thêm query vào lịch sử tìm kiếm và giới hạn 10 lịch sử gần nhất
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          searchHistory: { 
            $each: [searchQuery], 
            $position: 0, 
            $slice: 10 
          } 
        } 
      },
      { new: true }
    );

    res.status(200).json({ message: "Search history updated successfully" });
  } catch (error) {
    console.error("❌ Error updating search history:", error.message);
    res.status(500).json({ message: "Failed to update search history" });
  }
};

// Lấy lịch sử xem phim của người dùng
export const getWatchedHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ watchedHistory: user.watchedHistory });
  } catch (error) {
    console.error("❌ Error fetching watch history:", error.message);
    res.status(500).json({ message: "Failed to fetch watch history" });
  }
};