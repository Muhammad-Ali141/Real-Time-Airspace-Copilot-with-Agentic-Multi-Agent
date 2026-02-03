import React from "react";
import Card from "./Card.jsx";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, Clock, Plane, MapPin } from "lucide-react";

const AlertsTable = ({ alerts }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Alert indicator background */}
      {alerts.length > 0 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/5 rounded-bl-full" />
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              alerts.length > 0 
                ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-lg" 
                : "bg-slate-200 dark:bg-slate-700"
            }`}>
              <Bell className={`h-4 w-4 ${
                alerts.length > 0 ? "text-white" : "text-slate-400 dark:text-slate-500"
              }`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Alerts
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-red-500 shadow-lg"
            />
          )}
        </div>

        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/5 dark:to-green-500/5 mb-4">
              <AlertTriangle className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              All Clear
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              No active alerts detected in the airspace
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900"
          >
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="min-w-full text-xs">
                <thead className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-b-2 border-red-100 dark:border-red-900/30 sticky top-0">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Plane className="h-3.5 w-3.5" />
                        Flight
                      </div>
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Region
                      </div>
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Issue
                      </div>
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      Severity
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Time
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a, idx) => {
                    const isCritical = (a.severity || "").toLowerCase() === "critical";
                    return (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`border-b border-slate-100 dark:border-slate-800 transition-all ${
                          isCritical
                            ? "bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                            : "hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-lg ${
                              isCritical 
                                ? "bg-red-100 dark:bg-red-900/30" 
                                : "bg-amber-100 dark:bg-amber-900/30"
                            }`}>
                              <Plane className={`h-3 w-3 ${
                                isCritical 
                                  ? "text-red-600 dark:text-red-400" 
                                  : "text-amber-600 dark:text-amber-400"
                              }`} />
                            </div>
                            <span className="font-bold font-mono text-slate-900 dark:text-white">
                              {(a.callsign || "").trim() || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {a.region || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(a.anomalies || []).slice(0, 3).map((anomaly, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                              >
                                <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                                {anomaly.replace(" anomaly", "").replace("Anomaly", "")}
                              </span>
                            ))}
                            {(a.anomalies || []).length > 3 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                +{(a.anomalies || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
                              isCritical
                                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md"
                                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                            }`}
                          >
                            {isCritical && <AlertTriangle className="h-3 w-3" />}
                            {(a.severity || "warning").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span className="font-semibold text-xs">
                              {formatTime(a.timestamp)}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide text-[10px]">
                  {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                UPD: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default AlertsTable;


