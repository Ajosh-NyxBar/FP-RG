import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const variants = {
  open: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
  },
  closed: {
    y: 50,
    opacity: 0,
  },
};

const Links = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/logout');
      }
    });
  };

  const items = [
    { name: "Home", path: "/" },
    { name: "Analyze Image", path: "/analyze-image" },
    { name: "Chat Analyze", path: "/chat-analyze" },
    { name: "Logout", path: "/logout", action: handleLogout },
  ];

  return (
    <motion.div className="links" variants={variants}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.action ? (
            <span onClick={item.action}>{item.name}</span>
          ) : (
            <Link to={item.path}>{item.name}</Link>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Links;