import React from "react";
import { motion } from "framer-motion";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

const MetricsCard = ({ title, value, subtitle, icon: Icon, trend, status = "normal", className = "" }) => {
  const statusColors = {
    normal: "from-emerald-500 to-green-500",
    warning: "from-amber-500 to-orange-500",
    critical: "from-red-500 to-rose-500",
    info: "from-blue-500 to-cyan-500",
  };

  const statusIcons = {
    normal: CheckCircle,
    warning: AlertCircle,
    critical: AlertCircle,
    info: Activity,
  };

  const StatusIcon = statusIcons[status] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg ${className}`}
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusColors[status] || statusColors.normal}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-br ${statusColors[status] || statusColors.normal} opacity-10 dark:opacity-20`}>
                <Icon className={`h-5 w-5 ${
                  status === "normal" ? "text-emerald-600 dark:text-emerald-400" :
                  status === "warning" ? "text-amber-600 dark:text-amber-400" :
                  status === "critical" ? "text-red-600 dark:text-red-400" :
                  "text-blue-600 dark:text-blue-400"
                }`} />
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {title}
              </div>
              {subtitle && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <StatusIcon className={`h-4 w-4 ${
            status === "normal" ? "text-emerald-500" :
            status === "warning" ? "text-amber-500" :
            status === "critical" ? "text-red-500" :
            "text-blue-500"
          }`} />
        </div>

        <div className="flex items-baseline gap-2">
          <div className={`text-3xl font-bold ${
            status === "normal" ? "text-emerald-600 dark:text-emerald-400" :
            status === "warning" ? "text-amber-600 dark:text-amber-400" :
            status === "critical" ? "text-red-600 dark:text-red-400" :
            "text-blue-600 dark:text-blue-400"
          }`}>
            {value}
          </div>
          {trend && (
            <div className={`text-xs font-semibold ${
              trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}
            </div>
          )}
        </div>

        {subtitle && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            Updated just now
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricsCard;

