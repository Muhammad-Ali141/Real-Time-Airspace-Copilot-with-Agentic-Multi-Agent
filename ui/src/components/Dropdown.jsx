import React from "react";

const Dropdown = ({
  label,
  value,
  onChange,
  options,
  className = "",
  id,
}) => {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium ${className}`}>
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Dropdown;


