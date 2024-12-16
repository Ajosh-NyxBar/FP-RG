import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi there! How can I help you today? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [csvQuery, setCsvQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedChatHistory =
      JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(savedChatHistory);
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { sender: "user", text: input };
      setMessages([...messages, userMessage]);
      setInput("");

      try {
        const response = await axios.post(
          "http://localhost:8080/chat",
          { query: input },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const aiMessage = { sender: "ai", text: response.data.answer };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

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

  const handleChat = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/chat",
        { query: chatQuery },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newChatHistory = [
        ...chatHistory,
        { sender: "user", message: chatQuery },
        { sender: "ai", message: res.data.answer },
      ];
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCsvQueryChange = (e) => {
    setCsvQuery(e.target.value);
  };

  return (
    <div className="bg-gray-800 text-white max-w-2xl mx-auto p-5 rounded-lg">
      <div className="max-h-80 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-md ${
              msg.sender === "user"
                ? "bg-blue-500 text-right"
                : "bg-gray-700 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kirim pesan ke ChatGPT"
          className="flex-1 p-2 rounded-md border-none focus:ring-2 text-black focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Kirim
        </button>
        <input
          type="file"
          onChange={handleFileChange}
          className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        />
        <input
          type="text"
          value={csvQuery}
          onChange={(e) => setCsvQuery(e.target.value)}
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

export default Chat;
