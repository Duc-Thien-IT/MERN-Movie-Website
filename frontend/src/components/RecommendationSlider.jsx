import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/authUser";
import { SMALL_IMG_BASE_URL } from "../utils/constants";

const RecommendationSlider = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/v1/recommend/recommend/${user._id}`);
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchRecommendations();
    }
  }, [user]);

  const scrollLeft = () => {
    document.getElementById("recommendations-slider").scrollLeft -= 500;
  };

  const scrollRight = () => {
    document.getElementById("recommendations-slider").scrollLeft += 500;
  };

  if (loading) {
    return (
      <div className="px-8 md:px-16 lg:px-32 relative text-white">
        <h2 className="text-xl md:text-2xl mb-4 font-bold">Recommended For You</h2>
        <div className="flex gap-2 overflow-x-hidden">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="min-w-[180px] h-[270px] bg-gray-800 rounded shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show section if there are no recommendations or there's an error
  }

  return (
    <div className="px-4 md:px-16 lg:px-32 relative text-white">
      <h2 className="text-xl md:text-2xl mb-4 font-bold">Recommended For You</h2>
      
      <div className="group relative">
        <button 
          className="absolute top-0 bottom-0 left-0 z-40 flex items-center justify-center h-full px-2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30"
          onClick={scrollLeft}
        >
          <ChevronLeft className="size-8" />
        </button>

        <div 
          id="recommendations-slider" 
          className="flex gap-2 overflow-x-scroll scrollbar-hide scroll-smooth"
        >
          {recommendations.map((movie) => (
            <Link 
              to={`/watch/${movie.id}`} 
              key={movie.id} 
              className="min-w-[180px] transition-transform duration-300 hover:scale-105"
            >
              <img 
                src={SMALL_IMG_BASE_URL + movie.poster_path} 
                alt={movie.title || movie.name} 
                className="rounded object-cover w-full h-[270px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/movie-placeholder.png';
                }}
              />
            </Link>
          ))}
        </div>

        <button 
          className="absolute top-0 bottom-0 right-0 z-40 flex items-center justify-center h-full px-2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30"
          onClick={scrollRight}
        >
          <ChevronRight className="size-8" />
        </button>
      </div>
    </div>
  );
};

export default RecommendationSlider;