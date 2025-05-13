import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load tin nhắn từ localStorage khi component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Lưu tin nhắn vào localStorage khi có thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Chuyển đổi tin nhắn cho đúng định dạng API
      const apiMessages = messages.map(msg => ({
        role: msg.role === "bot" ? "assistant" : msg.role,
        content: msg.content
      }));
      
      // Thêm tin nhắn mới của người dùng
      apiMessages.push({ 
        role: "user", 
        content: input 
      });

      // Gọi API - JWT được gửi tự động thông qua cookie
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: apiMessages }),
        credentials: 'include' // Quan trọng: để gửi cookie
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Nếu không được xác thực, chuyển hướng đến trang đăng nhập
        if (res.status === 401) {
          window.location.href = '/login';
          throw new Error("Bạn cần đăng nhập để sử dụng chatbot");
        }
        
        throw new Error(
          errorData.message || `Server returned ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Error processing your request");
      }

      // Thêm tin nhắn từ bot vào state
      setMessages((prev) => [...prev, { 
        role: "bot", 
        content: data.reply,
        movieData: data.movieData 
      }]);
      
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { 
        role: "bot", 
        content: error.message || "Đã xảy ra lỗi, vui lòng thử lại sau."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xóa lịch sử chat
  const clearChat = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử chat không?")) {
      setMessages([]);
      localStorage.removeItem("chatMessages");
    }
  };

  const renderMessageContent = (message) => {
    if (message.movieData && message.movieData.length > 0) {
      return (
        <div className="movie-recommendation">
          <p>{message.content}</p>
          <div className="movies-grid">
            {message.movieData.map((movie, index) => (
              <div key={index} className="movie-card">
                <h4>{movie.title}</h4>
                {movie.poster_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    alt={movie.title}
                  />
                )}
                <p>{movie.overview && movie.overview.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return message.content;
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <h3>Netflix Assistant</h3>
            <div className="header-buttons">
              <button 
                onClick={clearChat} 
                className="clear-btn"
                title="Xóa lịch sử"
                disabled={isLoading || messages.length === 0}
              >
                🗑️
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="close-btn"
                disabled={isLoading}
              >
                ×
              </button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>Xin chào! Tôi là trợ lý Netflix của bạn.</p>
                <p>Bạn có thể hỏi tôi về phim, chương trình TV, hoặc nhận gợi ý!</p>
                <p>Thử hỏi: "Gợi ý phim hành động hay" hoặc "Phim kinh dị Netflix nào đáng xem?"</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`message ${m.role}`}>
                  {renderMessageContent(m)}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              className="send-btn"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`chatbot-button ${isOpen ? "active" : ""}`}
      >
        {isOpen ? "×" : "💬"}
      </div>
    </div>
  );
};

export default Chatbot;