import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header.jsx";
import Tabs from "./components/Tabs.jsx";
import TravelerPage from "./components/TravelerPage.jsx";
import OpsDashboard from "./components/OpsDashboard.jsx";

export const MCP_SERVER_URL = "http://localhost:8000";
export const REGIONS = ["region1", "region2", "region3", "region4"];

function App() {
  const [theme, setTheme] = useState("light");
  const [mcpConnected, setMcpConnected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${MCP_SERVER_URL}/flights/region/region1`, {
          timeout: 2000,
        });
        setMcpConnected(res.status === 200);
      } catch {
        setMcpConnected(false);
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <Header
          theme={theme}
          setTheme={setTheme}
          mcpConnected={mcpConnected}
        />

        <main className="flex-1 max-w-7xl mx-auto px-4 pb-8 w-full">
          <Tabs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-6"
            >
              <Routes>
                <Route
                  path="/traveler"
                  element={<TravelerPage mcpConnected={mcpConnected} />}
                />
                <Route
                  path="/ops"
                  element={<OpsDashboard mcpConnected={mcpConnected} />}
                />
                <Route path="*" element={<Navigate to="/traveler" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="relative z-10 py-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">ATC Operations Center v2.0</span>
              <span className="mx-2">•</span>
              <span>Real-Time Air Traffic Management System</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYSTEM: OPERATIONAL</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <div>
                {new Date().toLocaleString(undefined, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).toUpperCase()}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;


