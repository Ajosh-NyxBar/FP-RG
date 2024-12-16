import React from "react";
import { useNavigate } from "react-router-dom";

const Button = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/analyze-image");
  };


  return (
    <button
      onClick={handleClick}
      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Go to Analyze Image
    </button>
  );
};

const BackButton = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  };
  return (
    <button onClick={handleBack} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-6">
      Back To Chat
    </button>
  );
};
export { Button, BackButton };