import React from "react";
import { Send, Trash2, Plane, MessageSquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Dropdown from "./Dropdown.jsx";
import Card from "./Card.jsx";
import { REGIONS } from "../App.jsx";

const TravelerForm = ({
  callsign,
  setCallsign,
  question,
  setQuestion,
  region,
  setRegion,
  loading,
  onSend,
  onClear,
}) => {
  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));

  return (
    <Card className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Flight Inquiry System</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query real-time flight status, position, and operational data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Plane className="h-3 w-3" />
              Flight Callsign
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., THY4KZ"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
              />
              {callsign && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  ✓
                </motion.div>
              )}
            </div>
          </label>
          <Dropdown
            label="Region"
            value={region}
            onChange={setRegion}
            options={regionOptions}
          />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Your Question
          </span>
          <textarea
            rows={4}
            placeholder="Ask about altitude, speed, route, delays, or nearby flights..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none hover:border-slate-300 dark:hover:border-slate-600"
          />
          <div className="text-[10px] text-slate-400 text-right">
            {question.length} characters
          </div>
        </label>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClear}
            disabled={loading || (!callsign && !question)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
          <motion.button
            type="button"
            onClick={onSend}
            disabled={loading || !callsign || !question}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2 text-xs font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Query
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Card>
  );
};

export default TravelerForm;


