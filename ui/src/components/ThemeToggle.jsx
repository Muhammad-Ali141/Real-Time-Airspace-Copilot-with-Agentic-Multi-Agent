import React from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ theme, setTheme }) => {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-300" />
          Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-sky-500" />
          Dark
        </>
      )}
    </button>
  );
};

export default ThemeToggle;


