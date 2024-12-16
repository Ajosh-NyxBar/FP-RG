import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { AuthProvider } from "./Routes/AuthContext";
import ProtectedRoute from "./Routes/ProtectedRoutes";
import Chat from "./components/Chat";
import ChatImg from "./components/ChatImg";
import Sidebar from "./components/sidebar/Sidebar"; // Import Sidebar
import Transition from "./components/Transition"; // Import Transition
import Logout from "./auth/Logout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />} {/* Conditionally render Sidebar */}
      <div className={`flex-1 max-w-2xl mx-auto p-5 text-center font-sans ${hideSidebar ? 'w-full' : ''}`}>
        <h1 className="text-3xl font-bold text-gray-800 mb-5">Data Analysis Chatbot</h1>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute element={Chat} />} />
            <Route path="/analyze-image" element={<ChatImg />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
          <Transition />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;