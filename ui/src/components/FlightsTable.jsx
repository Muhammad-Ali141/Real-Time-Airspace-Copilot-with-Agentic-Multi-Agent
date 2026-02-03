import React from "react";
import { motion } from "framer-motion";
import { Plane, TrendingUp, TrendingDown, Gauge, Compass, AlertTriangle, CheckCircle2, Navigation } from "lucide-react";

const FlightsTable = ({ flights, formatAltitude, formatSpeed, formatHeading, detectAnomalies, region, formatVerticalRate }) => {
  if (!flights.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 mb-4">
          <Plane className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          No flight data available
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Click &quot;Refresh Flights&quot; or &quot;Analyze Region&quot; to load data
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div className="overflow-x-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900">
        <table className="min-w-full text-xs">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b-2 border-slate-200 dark:border-slate-700">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5" />
                  Callsign
                </div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Altitude (ft)
                </div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" />
                  GS (kts)
                </div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  HDG (°)
                </div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  VS (ft/min)
                </div>
              </th>
              <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f, idx) => {
              const anomalies = detectAnomalies(f);
              const isNormal = anomalies.length === 1 && anomalies[0] === "Normal";
              
              return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-800/50 transition-all group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${
                        isNormal 
                          ? "bg-emerald-100 dark:bg-emerald-900/30" 
                          : "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        <Plane className={`h-3 w-3 ${
                          isNormal 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-amber-600 dark:text-amber-400"
                        }`} />
                      </div>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {(f.callsign || "").trim() || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatAltitude(f.baro_altitude)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        {formatSpeed(f.velocity)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {f.velocity != null && f.velocity > 300 ? "High" : f.velocity != null && f.velocity > 200 ? "Normal" : "Low"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                          {formatHeading(f.true_track)}
                        </span>
                        {f.true_track != null && (
                          <div 
                            className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center opacity-70"
                            style={{
                              transform: `rotate(${f.true_track}deg)`,
                            }}
                          >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {f.vertical_rate != null && f.vertical_rate > 500 ? (
                        <>
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                            +{Math.trunc(f.vertical_rate)}
                          </span>
                        </>
                      ) : f.vertical_rate != null && f.vertical_rate < -500 ? (
                        <>
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          <span className="font-bold font-mono text-red-600 dark:text-red-400 text-sm">
                            {Math.trunc(f.vertical_rate)}
                          </span>
                        </>
                      ) : f.vertical_rate != null ? (
                        <>
                          <Navigation className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold font-mono text-slate-600 dark:text-slate-400 text-sm">
                            {Math.trunc(f.vertical_rate)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold font-mono text-slate-400 text-sm">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {anomalies.map((a, aIdx) => (
                        <motion.span
                          key={aIdx}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            a === "Normal"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                          }`}
                        >
                          {a === "Normal" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Normal
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              {a}
                            </>
                          )}
                        </motion.span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {flights.length} active flight{flights.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wide">
            Sector: {region.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            UPD: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default FlightsTable;


