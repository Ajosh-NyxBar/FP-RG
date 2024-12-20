import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const ChatAnalyze = () => {
  const [file, setFile] = useState(null);
  const [csvQuery, setCsvQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedChatHistory =
      JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(savedChatHistory);
  }, []);

  const handleUploadAndAnalyze = async () => {
    if (!file || !csvQuery.trim()) {
      console.error("File or query is missing");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", csvQuery);

    try {
      const res = await axios.post("http://localhost:8080/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const newChatHistory = [
        ...chatHistory,
        { sender: "user", message: csvQuery },
        { sender: "ai", message: res.data.answer },
      ];
      setChatHistory(newChatHistory);
      localStorage.setItem("chatHistory", JSON.stringify(newChatHistory));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCsvQueryChange = (e) => {
    setCsvQuery(e.target.value);
  };

  return (
    <div className="bg-gray-800 text-white max-w-2xl mx-auto p-5 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          onChange={handleFileChange}
          className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        />
        <input
          type="text"
          value={csvQuery}
          onChange={handleCsvQueryChange}
          placeholder="Masukkan query CSV"
          className="flex-1 p-2 rounded-md border-none focus:ring-2 text-black focus:ring-blue-500"
        />
        <button
          onClick={handleUploadAndAnalyze}
          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Analyze
        </button>
      </div>
      <div className="mt-5 p-2 border border-gray-300 rounded-md bg-black w-full">
        <h2 className="text-lg font-bold mb-2">Chat History</h2>
        <button
          onClick={handleClearChatHistory}
          className="p-2 mb-2 text-white bg-red-600 rounded-md cursor-pointer w-full"
        >
          Clear Chat History
        </button>
        <div className="chat-history max-h-96 overflow-y-auto">
          {chatHistory.map((chat, index) => (
            <motion.div
              key={index}
              className={`chat-message ${
                chat.sender === "user" ? "text-right" : "text-left"
              } mb-2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className={`p-2 ${
                  chat.sender === "user" ? "bg-blue-700" : "bg-gray-600"
                } rounded-md inline-block`}
              >
                {chat.message}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalyze;