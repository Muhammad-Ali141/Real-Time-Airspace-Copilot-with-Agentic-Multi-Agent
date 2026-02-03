import React from "react";
import { NavLink } from "react-router-dom";
import { Plane, Radar } from "lucide-react";
import { motion } from "framer-motion";

const Tabs = () => {
  const base =
    "relative px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 inline-flex rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 p-1.5 shadow-lg"
    >
      <NavLink
        to="/traveler"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`
        }
      >
        <Plane className="h-4 w-4" />
        Traveler Mode
      </NavLink>
      <NavLink
        to="/ops"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`
        }
      >
        <Radar className="h-4 w-4" />
        Ops Mode
      </NavLink>
    </motion.div>
  );
};

export default Tabs;


