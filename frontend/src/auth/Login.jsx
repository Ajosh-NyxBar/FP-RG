import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Routes/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, auth, provider } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // State for message
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      try {
        const data = JSON.parse(text);
        if (response.ok) {
          console.log("Login successful:", data);
          localStorage.setItem("token", data.token); // Save token to localStorage
          login(); // Set authentication state
          navigate("/"); // Redirect to root
          setMessage("Login successful"); // Set success message
        } else {
          console.error("Login failed:", data);
          setMessage("Login failed"); // Set error message
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        console.error("Server response:", text);
        setMessage("Login failed"); // Set error message
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Login failed"); // Set error message
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      localStorage.setItem("token", token); // Save token to localStorage
      login(); // Set authentication state
      navigate("/"); // Redirect to root
      setMessage("Login successful"); // Set success message
    } catch (error) {
      console.error("Error during Google login:", error);
      setMessage("Login failed"); // Set error message
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
          <p>You don't have an account? <button type="button" className="text-blue-500" onClick={handleRegister}>Register</button> here</p>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>} {/* Display message */}
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FcGoogle className="mr-2" />
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;