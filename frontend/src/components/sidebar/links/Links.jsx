import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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
  const items = [
    { name: "Home", path: "/" },
    { name: "Analyze Image", path: "/analyze-image" },
    { name: "Logout", path: "/logout" },
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
          <Link to={item.path}>{item.name}</Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Links;