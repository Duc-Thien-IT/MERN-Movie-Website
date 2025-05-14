import * as tf from "@tensorflow/tfjs";
import { getAllMovies, buildMovieFeatureVectors } from "./movieUtils.js";
import { User } from "../models/user.model.js";

let model;
let movieVectorsCache = null;
let lastTrainingTime = null;

// Khởi tạo cache dữ liệu phim
export const initializeMovieData = async () => {
  const movies = await getAllMovies();
  movieVectorsCache = buildMovieFeatureVectors(movies);
  console.log(`✅ Initialized cache with ${movieVectorsCache.length} movies`);
  return movieVectorsCache;
};

// Huấn luyện mô hình đề xuất
export const trainModel = async (forceRetrain = false) => {
  try {
    // Chỉ huấn luyện lại mô hình nếu chưa từng được huấn luyện hoặc bắt buộc huấn luyện lại
    const now = new Date();
    if (model && lastTrainingTime && !forceRetrain) {
      const hoursSinceLastTraining = (now - lastTrainingTime) / (1000 * 60 * 60);
      if (hoursSinceLastTraining < 24) {
        console.log(`⏩ Skipping training, model already trained ${hoursSinceLastTraining.toFixed(2)} hours ago`);
        return { status: "skipped", lastTrainedAt: lastTrainingTime };
      }
    }

    // Lấy dữ liệu phim hoặc sử dụng cache
    if (!movieVectorsCache) {
      await initializeMovieData();
    }

    // Chuẩn bị tensor dữ liệu
    const xs = tf.tensor2d(movieVectorsCache.map((m) => m.features));
    const ys = tf.tensor2d(movieVectorsCache.map((m) => m.features));

    // Tạo mô hình
    model = tf.sequential();
    model.add(tf.layers.dense({ 
      inputShape: [xs.shape[1]], 
      units: 10, 
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));
    model.add(tf.layers.dense({ 
      units: 8, 
      activation: "relu" 
    }));
    model.add(tf.layers.dense({ 
      units: xs.shape[1], 
      activation: "sigmoid" 
    }));

    // Biên dịch và huấn luyện mô hình
    model.compile({ 
      optimizer: tf.train.adam(0.001), 
      loss: "meanSquaredError",
      metrics: ["mse"]
    });
    
    // Huấn luyện mô hình
    const result = await model.fit(xs, ys, { 
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(5)}`);
          }
        }
      }
    });

    lastTrainingTime = now;
    console.log("✅ Model trained successfully!");
    
    return { 
      status: "trained", 
      lastTrainedAt: lastTrainingTime,
      finalLoss: result.history.loss[result.history.loss.length - 1]
    };
  } catch (error) {
    console.error("❌ Error training model:", error);
    throw error;
  }
};

// Đề xuất phim dựa trên lịch sử xem của người dùng
export const recommendMovies = async (userId) => {
  try {
    // Kiểm tra mô hình đã được huấn luyện chưa
    if (!model) {
      console.log("⚠️ Model not trained yet, training now...");
      await trainModel();
    }

    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return [];
    }

    // Lấy lịch sử xem phim
    const watchedMovieIds = user.watchedHistory || [];
    if (watchedMovieIds.length === 0) {
      console.log("⚠️ User has no watch history, returning popular movies");
      if (!movieVectorsCache) await initializeMovieData();
      // Trả về 10 phim đầu tiên nếu không có lịch sử xem
      return movieVectorsCache.slice(0, 10).map(m => m.raw);
    }

    // Đảm bảo cache dữ liệu phim đã được khởi tạo
    if (!movieVectorsCache) {
      await initializeMovieData();
    }

    // Lấy vectors của các phim đã xem
    const watchedVectors = movieVectorsCache.filter(m => 
      watchedMovieIds.includes(m.id)
    );
    
    if (watchedVectors.length === 0) {
      console.log("⚠️ No matching watched movies found in database");
      return movieVectorsCache.slice(0, 10).map(m => m.raw);
    }

    // Tạo vector đặc trưng trung bình cho phim đã xem
    const inputTensor = tf.tensor2d(
      watchedVectors.map(m => m.features)
    ).mean(0).reshape([1, watchedVectors[0].features.length]);

    // Dự đoán sở thích
    const prediction = model.predict(inputTensor);
    const predictedArray = await prediction.array();

    // Tính điểm tương đồng và sắp xếp kết quả
    const scores = movieVectorsCache.map(m => {
      const featureVector = tf.tensor1d(m.features);
      const predVector = tf.tensor1d(predictedArray[0]);
      
      // Tính cosine similarity
      const dotProduct = featureVector.dot(predVector).arraySync();
      const magA = Math.sqrt(m.features.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(predictedArray[0].reduce((sum, v) => sum + v * v, 0));
      const similarity = magA * magB > 0 ? dotProduct / (magA * magB) : 0;
      
      return { id: m.id, similarity, title: m.raw.title };
    });

    // Lọc phim đã xem và sắp xếp theo độ tương đồng
    const recommendedMovies = scores
      .filter(s => !watchedMovieIds.includes(s.id))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(s => {
        const movie = movieVectorsCache.find(m => m.id === s.id);
        return {
          ...movie.raw,
          similarity_score: s.similarity.toFixed(4)
        };
      });

    return recommendedMovies;
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    throw error;
  }
};

// Lấy thông tin mô hình
export const getModelInfo = () => {
  return {
    trained: !!model,
    lastTrainingTime: lastTrainingTime ? new Date(lastTrainingTime).toISOString() : null,
    movieCacheSize: movieVectorsCache ? movieVectorsCache.length : 0
  };
};