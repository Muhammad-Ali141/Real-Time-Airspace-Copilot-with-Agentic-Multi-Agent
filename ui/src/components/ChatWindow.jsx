import React, { useEffect, useRef } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Card from "./Card.jsx";
import ChatBubble from "./ChatBubble.jsx";

const ChatWindow = ({ messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[500px] lg:h-[600px] relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-cyan-500/20 animate-pulse" />
      </div>

      <div className="relative flex flex-col h-full">
        {/* Enhanced header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Flight Query Log</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {messages.length} {messages.length === 1 ? "entry" : "entries"} • Active session
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              <span className="font-semibold">Live</span>
            </div>
          )}
        </div>

        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 mb-4">
              <MessageSquare className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No conversations yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Enter a flight callsign and ask a question to start chatting with the AI assistant
            </p>
          </motion.div>
        ) : (
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(148 163 184) transparent",
            }}
          >
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgb(148 163 184);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgb(100 116 139);
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgb(51 65 85);
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgb(71 85 105);
              }
            `}</style>
            {messages.map((msg, idx) => (
              <ChatBubble key={`${idx}-${msg.timestamp}`} message={msg} />
            ))}
            <div className="h-4" /> {/* Spacing at bottom */}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatWindow;


