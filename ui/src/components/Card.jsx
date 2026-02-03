import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "", noMotion = false }) => {
  const base =
    "rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl border border-slate-200/80 dark:border-slate-700/80 p-6";

  if (noMotion) {
    return <div className={`${base} ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`${base} ${className} transition-shadow hover:shadow-2xl`}
    >
      {children}
    </motion.div>
  );
};

export default Card;


