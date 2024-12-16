import "./Sidebar.scss";
import Links from "./links/Links";
import ToggleButton from "./toogleButton/ToggleButton";
import { useState } from "react";
import { motion } from "framer-motion";

const variants = {
  open: {
    clipPath: "circle(1200px at 50px 50px)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  closed: {
    clipPath: "circle(30px at 35px 50px)",
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 300,
      damping: 50,
    },
  },
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="sidebar"
      animate={open ? "open" : "closed"}
      variants={variants}
    >
      <motion.div className="bg" variants={variants}>
        <div className="links">
          <Links />
        </div>
      </motion.div>
      <ToggleButton setOpen={setOpen} />
    </motion.div>
  );
};

export default Sidebar;
