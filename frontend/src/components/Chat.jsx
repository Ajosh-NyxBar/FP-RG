import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi there! How can I help you today? 😊" },
  ]);
  const [input, setInput] = useState("");


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


  return (
    <div className="bg-gray-800 text-white max-w-5xl mx-auto p-5 rounded-lg">
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
      </div>
    </div>
  );
};

export default Chat;
