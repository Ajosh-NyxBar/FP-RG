import React, { useState } from "react";
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
  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndAnalyze = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post('http://localhost:8080/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      setResponse(res.data.answer);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleCsvQuery = async () => {
    try {
      const res = await axios.post("http://localhost:8080/csv-query", { query: csvQuery }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      setResponse(res.data.answer);
    } catch (error) {
      console.error("Error querying CSV data:", error);
    }
  };

  const handleChat = async () => {
    try {
      const res = await axios.post("http://localhost:8080/chat", { query: chatQuery }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      setResponse(res.data.answer);
    } catch (error) {
      console.error("Error querying chat:", error);
    }
  };

  const ProtectedComponent = () => (
    <div className="flex flex-col items-center mb-5">
      <div className="flex flex-col items-center mb-5">
        <input type="file" onChange={handleFileChange} className="p-2 mb-2 border border-gray-300 rounded-md" />
        <input
          type="text"
          value={csvQuery}
          onChange={(e) => setCsvQuery(e.target.value)}
          placeholder="Question about CSV"
          className="p-2 mb-2 border border-gray-300 rounded-md w-full"
        />
        <button onClick={handleCsvQuery} className="p-2 mb-2 text-white bg-green-600 rounded-md cursor-pointer">
          Chat About CSV
        </button>
      </div>
      <div className="mb-5">
        <input
          type="text"
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          placeholder="Ask a question..."
          className="p-2 mb-2 border border-gray-300 rounded-md w-full"
        />
        <button onClick={handleChat} className="p-2 text-white bg-blue-600 rounded-md cursor-pointer">
          Chat
        </button>
      </div>
      <div className="mt-5 p-2 border border-gray-300 rounded-md bg-gray-100">
        <h2 className="text-lg font-bold">Response</h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, staggerChildren: 0.1 }}
        >
          {response.split("").map((char, index) => (
            <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.005 }}>
              {char}
            </motion.span>
          ))}
        </motion.p>
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