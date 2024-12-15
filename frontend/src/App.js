import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { AuthProvider } from "./Routes/AuthContext";
import ProtectedRoute from "./Routes/ProtectedRoutes";

function App() {
  const [file, setFile] = useState(null);
  const [csvQuery, setCsvQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedChatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(savedChatHistory);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleCsvQueryChange = (e) => {
    setCsvQuery(e.target.value);
  };

  const handleUploadAndAnalyze = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", csvQuery);

    try {
      const res = await axios.post('http://localhost:8080/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const newChatHistory = [...chatHistory, { sender: "user", message: csvQuery }, { sender: "ai", message: res.data.answer }];
      setChatHistory(newChatHistory);
      localStorage.setItem("chatHistory", JSON.stringify(newChatHistory));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleChat = async () => {
    try {
      const res = await axios.post("http://localhost:8080/chat", { query: chatQuery }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const newChatHistory = [...chatHistory, { sender: "user", message: chatQuery }, { sender: "ai", message: res.data.answer }];
      setChatHistory(newChatHistory);
      localStorage.setItem("chatHistory", JSON.stringify(newChatHistory));
    } catch (error) {
      console.error("Error querying chat:", error);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  const ProtectedComponent = () => (
    <div className="flex flex-col items-center mb-5">
      <div className="flex flex-col items-center mb-5">
        <input type="file" onChange={handleFileChange} className="p-2 mb-2 border border-gray-300 rounded-md" />
        <input
          type="text"
          placeholder="Question about CSV"
          value={csvQuery}
          onChange={handleCsvQueryChange}
          className="p-2 mb-2 border border-gray-300 rounded-md w-full"
        />
        <button onClick={handleUploadAndAnalyze} className="p-2 mb-2 text-white bg-green-600 rounded-md cursor-pointer">
          Chat About CSV
        </button>
      </div>
      <div className="mb-5">
        <input
          type="text"
          onChange={(e) => setChatQuery(e.target.value)}
          placeholder="Ask a question..."
          className="p-2 mb-2 border border-gray-300 rounded-md w-full"
        />
        <button onClick={handleChat} className="p-2 text-white bg-blue-600 rounded-md cursor-pointer">
          Chat
        </button>
      </div>
      <div className="mt-5 p-2 border border-gray-300 rounded-md bg-gray-100 w-full">
        <h2 className="text-lg font-bold">Chat History</h2>
        <button onClick={handleClearChatHistory} className="p-2 mb-2 text-white bg-red-600 rounded-md cursor-pointer">
          Clear Chat History
        </button>
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <motion.div
              key={index}
              className={`chat-message ${chat.sender === "user" ? "text-right" : "text-left"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className={`p-2 mb-2 ${chat.sender === "user" ? "bg-blue-200" : "bg-gray-200"} rounded-md inline-block`}>
                {chat.message}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="max-w-2xl mx-auto p-5 text-center font-sans">
          <h1 className="text-3xl font-bold text-gray-800 mb-5">Data Analysis Chatbot</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute element={ProtectedComponent} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;