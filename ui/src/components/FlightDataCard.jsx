import React from "react";
import { motion } from "framer-motion";
import { Plane, TrendingUp, TrendingDown, Gauge, Compass, Navigation, MapPin } from "lucide-react";

const FlightDataCard = ({ flight, formatAltitude, formatSpeed, formatHeading }) => {
  if (!flight || flight.error) {
    return null;
  }

  const altitude = flight.baro_altitude;
  const speed = flight.velocity;
  const heading = flight.true_track;
  const verticalRate = flight.vertical_rate;
  const latitude = flight.latitude;
  const longitude = flight.longitude;
  const originCountry = flight.origin_country;

  // Altitude category
  const getAltitudeCategory = (alt) => {
    if (alt == null) return { category: "UNKNOWN", color: "slate", band: "N/A" };
    const feet = Math.trunc(alt);
    if (feet < 10000) return { category: "LOW", color: "red", band: "10K" };
    if (feet < 18000) return { category: "TRANSITION", color: "amber", band: "18K" };
    if (feet < 35000) return { category: "CRUISE", color: "emerald", band: "35K" };
    if (feet < 45000) return { category: "HIGH", color: "blue", band: "45K" };
    return { category: "VERY HIGH", color: "purple", band: "MAX" };
  };

  const altCategory = getAltitudeCategory(altitude);

  // Speed category
  const getSpeedCategory = (spd) => {
    if (spd == null) return { category: "UNKNOWN", color: "slate" };
    const kts = Math.trunc(spd);
    if (kts < 200) return { category: "SLOW", color: "red" };
    if (kts < 300) return { category: "NORMAL", color: "emerald" };
    if (kts < 450) return { category: "FAST", color: "blue" };
    return { category: "VERY FAST", color: "purple" };
  };

  const spdCategory = getSpeedCategory(speed);

  // Vertical rate indicator
  const getVerticalRate = () => {
    if (verticalRate == null) return { direction: "LEVEL", icon: null, color: "slate" };
    const rate = Math.trunc(verticalRate);
    if (rate > 500) return { direction: "CLIMB", icon: TrendingUp, color: "emerald" };
    if (rate < -500) return { direction: "DESCEND", icon: TrendingDown, color: "red" };
    return { direction: "LEVEL", icon: null, color: "slate" };
  };

  const vRate = getVerticalRate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-5 text-white font-mono shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-wider">
              {(flight.callsign || "").trim() || "UNKNOWN"}
            </div>
            <div className="text-xs text-slate-400">{originCountry || "N/A"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Flight ID</div>
          <div className="text-xs font-semibold">{flight.icao24 || "N/A"}</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Altitude */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Altitude</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              altCategory.color === "red" ? "bg-red-500/20 text-red-300" :
              altCategory.color === "amber" ? "bg-amber-500/20 text-amber-300" :
              altCategory.color === "emerald" ? "bg-emerald-500/20 text-emerald-300" :
              altCategory.color === "blue" ? "bg-blue-500/20 text-blue-300" :
              "bg-purple-500/20 text-purple-300"
            }`}>
              {altCategory.band}
            </span>
          </div>
          <div className="text-xl font-bold">
            {formatAltitude(altitude)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{altCategory.category}</div>
        </div>

        {/* Speed */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Speed</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              spdCategory.color === "red" ? "bg-red-500/20 text-red-300" :
              spdCategory.color === "emerald" ? "bg-emerald-500/20 text-emerald-300" :
              spdCategory.color === "blue" ? "bg-blue-500/20 text-blue-300" :
              "bg-purple-500/20 text-purple-300"
            }`}>
              {spdCategory.category}
            </span>
          </div>
          <div className="text-xl font-bold">
            {formatSpeed(speed)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ground Speed</div>
        </div>

        {/* Heading */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Heading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">{formatHeading(heading)}</div>
            {heading != null && (
              <div
                className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center relative"
                style={{
                  transform: `rotate(${heading}deg)`,
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-blue-400 rounded-full" />
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">True Track</div>
        </div>

        {/* Vertical Rate */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            {vRate.icon ? (
              <vRate.icon className={`h-4 w-4 text-${vRate.color}-400`} />
            ) : (
              <Navigation className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Vertical Rate</span>
          </div>
          <div className={`text-xl font-bold ${
            vRate.color === "red" ? "text-red-300" :
            vRate.color === "emerald" ? "text-emerald-300" :
            "text-slate-300"
          }`}>
            {verticalRate != null ? `${verticalRate > 0 ? "+" : ""}${Math.trunc(verticalRate)} ft/min` : "N/A"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{vRate.direction}</div>
        </div>
      </div>

      {/* Position */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Position</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Latitude</div>
            <div className="text-sm font-bold">{latitude != null ? latitude.toFixed(4) : "N/A"}°</div>
          </div>
          <div className="text-slate-600">|</div>
          <div>
            <div className="text-[10px] text-slate-400">Longitude</div>
            <div className="text-sm font-bold">{longitude != null ? longitude.toFixed(4) : "N/A"}°</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FlightDataCard;

