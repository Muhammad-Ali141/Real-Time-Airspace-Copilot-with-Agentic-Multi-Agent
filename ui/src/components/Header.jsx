import React from "react";
import { PlaneTakeoff, Radar, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";

const Header = ({ theme, setTheme, mcpConnected }) => {
  return (
    <header className="w-full relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 backdrop-blur-lg shadow-sm">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Logo with animated background */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-30 dark:opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-3 rounded-2xl shadow-lg flex items-center justify-center">
              <PlaneTakeoff className="h-7 w-7 text-white drop-shadow-lg" />
            </div>
          </motion.div>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              ATC Operations Center
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Radar className="h-3 w-3 text-slate-400" />
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Real-Time Air Traffic Monitoring & AI-Powered Flight Intelligence System
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          
          {/* Enhanced connection status */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-md transition-all duration-300 ${
              mcpConnected
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : "bg-gradient-to-r from-rose-500 to-red-500 text-white"
            }`}
          >
            {mcpConnected ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wifi className="h-4 w-4" />
                </motion.div>
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Disconnected</span>
              </>
            )}
            <motion.span
              className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                mcpConnected ? "bg-white" : "bg-white"
              }`}
              animate={{
                opacity: mcpConnected ? [1, 0.5, 1] : [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;


