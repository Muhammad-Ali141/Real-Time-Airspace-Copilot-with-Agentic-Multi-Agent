import React from "react";
import { motion } from "framer-motion";
import { User, Bot, AlertTriangle, Plane } from "lucide-react";

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";
  const align = isUser ? "items-end" : "items-start";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={`flex ${align} gap-2 mb-4`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md"
        >
          <Bot className="h-4 w-4 text-white" />
        </motion.div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div className="flex items-center gap-2 mb-1">
          {isUser && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-sm"
            >
              <User className="h-3 w-3 text-white" />
            </motion.div>
          )}
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {isUser ? `You${message.callsign ? ` • ${message.callsign}` : ""}` : "Airspace AI"}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl px-4 py-3 shadow-lg ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-br-sm"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm"
          }`}
        >
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "text-white" : ""}`}>
            {message.content}
          </div>

          <div className={`mt-2 flex items-center justify-between gap-3 ${
            isUser ? "text-white/70" : "text-slate-400"
          }`}>
            <div className="text-[10px] font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {message.timestamp}
            </div>
          </div>

          {message.need_ops && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-0.5">Ops Analysis Recommended</div>
                  <div className="font-normal text-amber-600 dark:text-amber-500">
                    Switch to Ops Mode to view regional traffic and anomalies
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {message.callsign && isUser && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-white/80">
              <Plane className="h-3 w-3" />
              <span>Flight: {message.callsign}</span>
            </div>
          )}
        </motion.div>
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-md"
        >
          <User className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatBubble;


