import React, { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, Radar, Activity, AlertTriangle, CheckCircle, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { MCP_SERVER_URL, REGIONS } from "../App.jsx";
import Card from "./Card.jsx";
import Dropdown from "./Dropdown.jsx";
import FlightsTable from "./FlightsTable.jsx";
import AlertsTable from "./AlertsTable.jsx";
import MetricsCard from "./MetricsCard.jsx";

const AIRLINE_FILTERS = [
  { id: "ALL", label: "All airlines" },
  { id: "QTR", label: "Qatar Airways (QTR)" },
  { id: "PIA", label: "Pakistan International (PIA)" },
  { id: "THY", label: "Turkish Airlines (THY)" },
  { id: "DLH", label: "Lufthansa (DLH)" },
  { id: "BAW", label: "British Airways (BAW)" },
  { id: "UAE", label: "Emirates (UAE)" },
  { id: "AIC", label: "Air India (AIC)" },
  { id: "ROT", label: "TAROM (ROT)" },
  { id: "WZZ", label: "Wizz Air (WZZ)" },
];

const OpsDashboard = ({ mcpConnected }) => {
  const [region, setRegion] = useState("region1");
  const [summary, setSummary] = useState("");
  const [flights, setFlights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [airlineFilter, setAirlineFilter] = useState("ALL");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);

  const loadFlights = async () => {
    if (!mcpConnected) return;
    setLoadingFlights(true);
    try {
      const res = await axios.get(
        `${MCP_SERVER_URL}/flights/region/${region}`,
        { timeout: 5000 }
      );
      setFlights(res.data.states || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFlights(false);
    }
  };

  const analyzeRegion = async () => {
    if (!mcpConnected) return;
    setLoadingSummary(true);
    try {
      const res = await axios.post(`${MCP_SERVER_URL}/ops/analyze`, {
        region,
      });
      setSummary(res.data.summary || "");
      setFlights(res.data.flights || []);
    } catch (e) {
      const detail =
        e.response?.data?.detail ??
        e.response?.data ??
        e.message ??
        "Unknown error";
      setSummary(`Error analyzing region: ${JSON.stringify(detail)}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadAlerts = async () => {
    if (!mcpConnected) return;
    try {
      const res = await axios.get(`${MCP_SERVER_URL}/alerts/active`, {
        timeout: 5000,
      });
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFlights();
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, mcpConnected]);

  const formatAltitude = (v) =>
    v == null ? "N/A" : `${Math.trunc(v).toLocaleString()}`;
  const formatSpeed = (v) => (v == null ? "N/A" : `${Math.trunc(v)}`);
  const formatHeading = (v) => (v == null ? "N/A" : `${Math.trunc(v)}`);
  const formatVerticalRate = (v) => (v == null ? "N/A" : `${Math.trunc(v)}`);

  const detectAnomalies = (flight) => {
    const anomalies = [];
    const altitude = flight.baro_altitude;
    if (altitude != null && (altitude > 40000 || altitude < 10000)) {
      anomalies.push("Altitude");
    }
    const velocity = flight.velocity;
    if (velocity != null && (velocity > 500 || velocity < 200)) {
      anomalies.push("Speed");
    }
    const vr = flight.vertical_rate;
    if (vr != null && Math.abs(vr) > 2000) {
      anomalies.push("Vertical Rate");
    }
    return anomalies.length ? anomalies : ["Normal"];
  };

  const getAirlineCode = (callsign) => {
    if (!callsign) return "";
    return callsign.trim().slice(0, 3).toUpperCase();
  };

  const filteredFlights = flights
    .filter((f) => {
      if (airlineFilter === "ALL") return true;
      return getAirlineCode(f.callsign) === airlineFilter;
    })
    .sort((a, b) => {
      const ac = (a.callsign || "").trim();
      const bc = (b.callsign || "").trim();
      return ac.localeCompare(bc);
    });

  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));
  const airlineOptions = AIRLINE_FILTERS.map((a) => ({
    value: a.id,
    label: a.label,
  }));

  // Calculate metrics
  const totalFlights = flights.length;
  const normalFlights = flights.filter(f => {
    const anomalies = detectAnomalies(f);
    return anomalies.length === 1 && anomalies[0] === "Normal";
  }).length;
  const anomalyFlights = totalFlights - normalFlights;
  const activeAlerts = alerts.length;

  return (
    <section className="mt-4 space-y-6">
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Flights"
          value={totalFlights}
          subtitle={`Active in ${region}`}
          icon={Plane}
          status={totalFlights > 0 ? "normal" : "info"}
        />
        <MetricsCard
          title="Normal Status"
          value={normalFlights}
          subtitle={`${totalFlights > 0 ? Math.round((normalFlights / totalFlights) * 100) : 0}% of flights`}
          icon={CheckCircle}
          status="normal"
        />
        <MetricsCard
          title="Anomalies"
          value={anomalyFlights}
          subtitle={`Requiring attention`}
          icon={AlertTriangle}
          status={anomalyFlights > 0 ? "warning" : "normal"}
        />
        <MetricsCard
          title="Active Alerts"
          value={activeAlerts}
          subtitle={`System-wide alerts`}
          icon={Activity}
          status={activeAlerts > 0 ? "critical" : "normal"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.3fr] gap-6 items-start">
        <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-light/10 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark">
                <Radar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Regional Airspace Analysis</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive traffic analysis, anomaly detection, and operational status for selected airspace sector.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dropdown
                label="Region"
                value={region}
                onChange={setRegion}
                options={regionOptions}
                className="w-28"
              />
              <Dropdown
                label="Airline"
                value={airlineFilter}
                onChange={setAirlineFilter}
                options={airlineOptions}
                className="w-40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <motion.button
              type="button"
              onClick={analyzeRegion}
              disabled={!mcpConnected || loadingSummary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Radar className={`h-4 w-4 ${loadingSummary ? "animate-spin" : ""}`} />
              {loadingSummary ? "Analyzing..." : "Analyze Region"}
            </motion.button>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={loadFlights}
                disabled={!mcpConnected || loadingFlights}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingFlights ? "animate-spin" : ""}`} />
                {loadingFlights ? "Refreshing..." : "Refresh"}
              </motion.button>
              <motion.button
                type="button"
                onClick={loadAlerts}
                disabled={!mcpConnected}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Alerts
              </motion.button>
            </div>
          </div>

          {summary ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/60 dark:to-blue-900/10 border-2 border-slate-200 dark:border-slate-700 px-5 py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 shadow-md"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-blue-500/20">
                    <Radar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    AI Analysis
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{summary}</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-8 rounded-xl bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-700"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Click &quot;Analyze Region&quot; to generate an AI-powered summary of this region&apos;s air traffic and anomalies.
              </p>
            </motion.div>
          )}

          <FlightsTable
            flights={filteredFlights}
            formatAltitude={formatAltitude}
            formatSpeed={formatSpeed}
            formatHeading={formatHeading}
            formatVerticalRate={formatVerticalRate}
            detectAnomalies={detectAnomalies}
            region={region}
          />
        </Card>
        </div>

        <AlertsTable alerts={alerts} />
      </div>
    </section>
  );
};

export default OpsDashboard;


