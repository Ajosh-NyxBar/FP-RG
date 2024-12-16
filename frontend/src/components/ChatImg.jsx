import React, { useState } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { BackButton } from "./Button";
const ChatImg = () => {
  const [imageURL, setImageURL] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  // const navigate = useNavigate();

  const handleAnalyzeImage = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/analyze-image",
        { image_url: imageURL, prompt: prompt },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setResponse(res.data.answer);
      setError("");
    } catch (err) {
      setError("Error analyzing image: " + err.message);
      setResponse("");
    }
  };

  // const handleBack = () => {
  //   navigate("/");
  // };

  return (
    <div className="bg-gray-800 text-white max-w-2xl mx-auto p-5 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Analyze Image</h2>
      <div className="mb-4">
        <label className="block mb-2">Image URL:</label>
        <input
          type="text"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          className="w-full p-2 rounded-md border-none focus:ring-2 text-black focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Prompt:</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 rounded-md border-none focus:ring-2 text-black focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleAnalyzeImage}
        className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Analyze
      </button>
      {response && (
        <div className="mt-4 p-2 bg-gray-700 rounded-md">
          <h3 className="text-lg font-bold">Response:</h3>
          <p>{response}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-2 bg-red-600 rounded-md">
          <h3 className="text-lg font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      {/* <BackButton /> */}
      {/* <button onClick={handleBack} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-6">
        Back To Chat
      </button> */}
    </div>
  );
};

export default ChatImg;
