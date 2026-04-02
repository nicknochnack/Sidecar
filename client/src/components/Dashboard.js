import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../utilities/api";
import Header from "./Header";
import Footer from "./Footer";
import TDCInsightsTab from "./TDCInsightsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters) {
  if (!meters) return "—";
  return `${(meters / 1000).toFixed(1)} km`;
}

function sportIcon(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("ride") || t.includes("cycling")) return "🚴";
  if (t.includes("run")) return "🏃";
  if (t.includes("swim")) return "🏊";
  if (t.includes("walk")) return "🚶";
  return "🏋️";
}

function tsbColor(tsb) {
  if (tsb === null || tsb === undefined)
    return "text-gray-400 dark:text-slate-400";
  if (tsb > 5) return "text-emerald-400";
  if (tsb > -10) return "text-yellow-400";
  return "text-red-400";
}

// ─── Training Load Tab ────────────────────────────────────────────────────────

function TrainingLoadTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/insights/training-load")
      .then((r) => setData(r.data))
      .catch((e) => {
        const msg = e.response?.data?.error || "Failed to load training data";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCards count={1} />;
  if (error)
    return (
      <ErrorCard
        message={error}
        hint="Connect Intervals.icu in Settings to see your training load."
      />
    );

  const latest = data[data.length - 1];
  const chartData = data.slice(-90).map((d) => ({
    date: d.date,
    CTL: d.ctl ? +d.ctl.toFixed(1) : null,
    ATL: d.atl ? +d.atl.toFixed(1) : null,
    TSB: d.tsb ? +d.tsb.toFixed(1) : null,
  }));

  return (
    <div className="space-y-4 mt-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Fitness (CTL)"
          value={latest?.ctl?.toFixed(1) ?? "—"}
          description="Chronic Training Load"
          color="text-blue-400"
        />
        <MetricCard
          label="Fatigue (ATL)"
          value={latest?.atl?.toFixed(1) ?? "—"}
          description="Acute Training Load"
          color="text-orange-400"
        />
        <MetricCard
          label="Form (TSB)"
          value={latest?.tsb?.toFixed(1) ?? "—"}
          description="Training Stress Balance"
          color={tsbColor(latest?.tsb)}
        />
      </div>

      {/* Chart */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 text-sm font-semibold">
            90-Day CTL / ATL / TSB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(d) => d?.slice(5)}
                interval={13}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
                labelStyle={{ color: "#1f2937" }}
              />
              <Legend wrapperStyle={{ color: "#6b7280" }} />
              <Line
                type="monotone"
                dataKey="CTL"
                stroke="#6B46C1"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="ATL"
                stroke="#FFD43B"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="TSB"
                stroke="#10b981"
                dot={false}
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Power Analysis Tab ────────────────────────────────────────────────────────

function PowerAnalysisTab() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback((d) => {
    setLoading(true);
    setError(null);
    api
      .get(`/insights/power?days=${d}`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Failed to load power data"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  if (loading) return <LoadingCards count={1} />;
  if (error)
    return (
      <ErrorCard
        message={error}
        hint="Connect Intervals.icu in Settings to see power analysis."
      />
    );

  const durations = [1, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600];
  const curvePoints = durations
    .map((s) => {
      const point = data.power_curve?.find((p) => p.secs === s);
      return point
        ? { label: formatDuration(s), watts: point.watts, secs: s }
        : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-4 mt-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="FTP"
          value={data.ftp ? `${data.ftp}w` : "—"}
          description="Functional Threshold Power"
          color="text-purple-400"
        />
        <MetricCard
          label="W/kg"
          value={data.w_per_kg ?? "—"}
          description="Power to Weight Ratio"
          color="text-cyan-400"
        />
        <MetricCard
          label="Weight"
          value={data.weight ? `${data.weight}kg` : "—"}
          description="Athlete Weight"
          color="text-gray-600 dark:text-slate-400"
        />
      </div>

      {/* Range selector */}
      <div className="flex gap-2">
        {[30, 90, 180, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              days === d
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Power curve chart */}
      {curvePoints.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 text-sm">
              Power Curve — last {days} days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={curvePoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} unit="w" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#cbd5e1" }}
                  formatter={(v) => [`${v}w`, "Power"]}
                />
                <Area
                  type="monotone"
                  dataKey="watts"
                  stroke="#a855f7"
                  fill="#a855f720"
                  strokeWidth={2}
                />
                {data.ftp && (
                  <ReferenceLine
                    y={data.ftp}
                    stroke="#60a5fa"
                    strokeDasharray="4 2"
                    label={{
                      value: `FTP ${data.ftp}w`,
                      fill: "#60a5fa",
                      fontSize: 11,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Activity Feed Tab ─────────────────────────────────────────────────────────

function ActivityFeedTab() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/insights/activities?per_page=20")
      .then((r) => setActivities(r.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Failed to load activities"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCards count={3} />;
  if (error)
    return (
      <ErrorCard message={error} hint="Connect Intervals.icu in Settings." />
    );
  if (activities.length === 0)
    return (
      <div className="mt-6 text-center text-gray-500 dark:text-slate-500">
        No recent activities found. Connect an integration in Settings.
      </div>
    );

  return (
    <div className="mt-4 space-y-3">
      {activities.map((activity) => (
        <Card
          key={`${activity.source}-${activity.id}`}
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <CardContent className="py-4 px-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {sportIcon(activity.sport_type || activity.type)}
                </span>
                <div>
                  <div className="font-medium text-slate-200">
                    {activity.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                    {new Date(activity.start_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    <span className="capitalize">
                      {(activity.sport_type || activity.type || "").replace(
                        /_/g,
                        " ",
                      )}
                    </span>
                    {" · "}
                    <span className="text-gray-400 dark:text-slate-400">
                      🔵 Intervals.icu
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-slate-200 font-medium">
                  {formatDistance(activity.distance)}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {formatDuration(activity.moving_time)}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-3 flex flex-wrap gap-4">
              {activity.average_watts && (
                <Stat
                  label="Avg Power"
                  value={`${Math.round(activity.average_watts)}w`}
                />
              )}
              {activity.weighted_average_watts && (
                <Stat
                  label="NP"
                  value={`${Math.round(activity.weighted_average_watts)}w`}
                />
              )}
              {activity.average_heartrate && (
                <Stat
                  label="Avg HR"
                  value={`${Math.round(activity.average_heartrate)} bpm`}
                />
              )}
              {activity.total_elevation_gain > 0 && (
                <Stat
                  label="Elevation"
                  value={`${Math.round(activity.total_elevation_gain)}m`}
                />
              )}
              {activity.suffer_score && (
                <Stat label="Suffer" value={activity.suffer_score} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── AI Insights Tab ──────────────────────────────────────────────────────────

function AIInsightsTab() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    try {
      const res = await api.post("/insights/ai");
      setInsights(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="py-5 px-5">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
            Claude analyzes your recent training data from connected
            integrations and generates personalized coaching insights — covering
            form, trends, and recommendations.
          </p>
          <Button
            onClick={generate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? "Generating…" : "Generate AI Insights"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <ErrorCard
          message={error}
          hint="Make sure you have at least one integration connected with recent activity data."
        />
      )}

      {insights && (
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 text-sm flex items-center gap-2">
              <span>✨ AI Coaching Insights</span>
              <span className="text-xs font-normal text-gray-500 dark:text-slate-500 ml-auto">
                {new Date(insights.generated_at).toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300">
              {insights.insights.split("\n").map((line, i) => {
                if (line.startsWith("## ") || line.startsWith("# ")) {
                  return (
                    <h3
                      key={i}
                      className="text-slate-100 font-semibold mt-4 mb-1"
                    >
                      {line.replace(/^#+\s/, "")}
                    </h3>
                  );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="text-slate-200 font-medium">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("- ") || line.startsWith("* ")) {
                  return (
                    <li
                      key={i}
                      className="ml-4 text-gray-700 dark:text-slate-300"
                    >
                      {line.replace(/^[-*]\s/, "")}
                    </li>
                  );
                }
                if (line.trim() === "") return <br key={i} />;
                return (
                  <p key={i} className="text-gray-700 dark:text-slate-300">
                    {line}
                  </p>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-500">
              Data from: {insights.data_sources.join(", ")}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, description, color }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <CardContent className="py-4 px-5">
        <div className="text-xs text-gray-500 dark:text-slate-500 mb-1">
          {label}
        </div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-slate-500">{label}</div>
      <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {value}
      </div>
    </div>
  );
}

function LoadingCards({ count = 2 }) {
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <CardContent className="py-5">
            <Skeleton className="h-6 w-1/3 bg-slate-700 mb-3 rounded" />
            <Skeleton className="h-4 w-full bg-slate-700 rounded mb-2" />
            <Skeleton className="h-4 w-2/3 bg-slate-700 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorCard({ message, hint }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 mt-4">
      <CardContent className="py-5 px-5">
        <div className="text-red-400 font-medium">{message}</div>
        {hint && (
          <div className="text-gray-500 dark:text-slate-500 text-sm mt-1">
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Smart Dashboard: PPI Gauge ───────────────────────────────────────────────

function PPIGauge({ tsb }) {
  const score = Math.max(0, Math.min(100, ((tsb + 20) / 35) * 100));

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx, cy, r, startDeg, endDeg) {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const START = -210;
  const END = 30;
  const currentAngle = START + (score / 100) * (END - START);

  let color, label;
  if (tsb === null || tsb === undefined) {
    color = "#64748b";
    label = "N/A";
  } else if (tsb > 10) {
    color = "#4ade80";
    label = "Peak";
  } else if (tsb > 0) {
    color = "#86efac";
    label = "Fresh";
  } else if (tsb > -10) {
    color = "#facc15";
    label = "Optimal";
  } else if (tsb > -20) {
    color = "#fb923c";
    label = "Tired";
  } else {
    color = "#f87171";
    label = "Fatigued";
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="110" viewBox="0 0 160 110">
        <path
          d={arcPath(80, 88, 55, START, END)}
          fill="none"
          stroke="#334155"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {tsb !== null && tsb !== undefined && (
          <path
            d={arcPath(80, 88, 55, START, currentAngle)}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        <text
          x="80"
          y="86"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="bold"
        >
          {tsb !== null && tsb !== undefined ? Math.round(score) : "—"}
        </text>
        <text x="80" y="103" textAnchor="middle" fill="#64748b" fontSize="11">
          {label}
        </text>
      </svg>
      <div className="text-xs text-gray-500 dark:text-slate-500 -mt-1">
        TSB:{" "}
        <span style={{ color }}>
          {tsb !== null && tsb !== undefined ? tsb.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Smart Dashboard: Health Calendar ─────────────────────────────────────────

function HealthCalendar({ activities }) {
  const activityMap = {};
  activities.forEach((a) => {
    const date = (a.start_date || "").split("T")[0];
    if (date) activityMap[date] = (activityMap[date] || 0) + 1;
  });

  const WEEKS = 13;
  const today = new Date();
  // Align to start of current week (Sunday)
  const startOffset = today.getDay();
  const totalDays = WEEKS * 7;

  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const daysAgo = totalDays - 1 - (w * 7 + d);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo + (6 - startOffset));
      const dateStr = date.toISOString().split("T")[0];
      week.push({ dateStr, count: activityMap[dateStr] || 0 });
    }
    weeks.push(week);
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  function cellColor(count) {
    if (count === 0) return "#1e293b";
    if (count === 1) return "#14532d";
    if (count === 2) return "#16a34a";
    return "#4ade80";
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        <div className="flex flex-col gap-1 mr-1 pt-5">
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className="text-slate-600 text-xs w-3 h-3 flex items-center justify-center leading-none"
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            <div
              className="text-slate-600 text-xs h-4 text-center leading-none"
              style={{ fontSize: 9 }}
            >
              {wi % 4 === 0 ? week[0].dateStr.slice(5, 7) : ""}
            </div>
            {week.map((cell, di) => (
              <div
                key={di}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: cellColor(cell.count) }}
                title={`${cell.dateStr}: ${cell.count} activity`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Smart Dashboard: Custom Chart Panel ─────────────────────────────────────

const CHART_COLORS = [
  "#60a5fa",
  "#fb923c",
  "#4ade80",
  "#f472b6",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f87171",
];

function CustomChartPanel({ config, trainingLoad, activities }) {
  const {
    chartType,
    title,
    dataSource,
    xKey = "date",
    series = [],
    groupBy,
    metric = "count",
    yAxisMin,
    yAxisMax,
    xAxisMin,
    xAxisMax,
  } = config;

  let chartData = [];

  if (dataSource === "training-load") {
    chartData = trainingLoad.slice(-90).map((d) => ({
      date: d.date,
      ctl: d.ctl ? +d.ctl.toFixed(1) : null,
      atl: d.atl ? +d.atl.toFixed(1) : null,
      tsb: d.tsb ? +d.tsb.toFixed(1) : null,
      rampRate: d.rampRate ? +d.rampRate.toFixed(2) : null,
    }));
  } else if (dataSource === "activities") {
    if (chartType === "pie") {
      const groups = {};
      activities.forEach((a) => {
        const key = (a[groupBy] || a.type || "Other").replace(/_/g, " ");
        let val;
        if (metric === "distance") val = (a.distance || 0) / 1000;
        else if (metric === "moving_time") val = (a.moving_time || 0) / 60;
        else if (metric === "average_watts") val = a.average_watts || 0;
        else val = 1;
        groups[key] = (groups[key] || 0) + val;
      });
      chartData = Object.entries(groups)
        .map(([name, value]) => ({ name, value: +value.toFixed(1) }))
        .sort((a, b) => b.value - a.value);
    } else {
      chartData = activities
        .slice(0, 30)
        .reverse()
        .map((a) => ({
          date: (a.start_date || "").split("T")[0],
          distance: a.distance ? +(a.distance / 1000).toFixed(1) : 0,
          moving_time: a.moving_time ? Math.round(a.moving_time / 60) : 0,
          average_watts: a.average_watts ? Math.round(a.average_watts) : null,
          average_heartrate: a.average_heartrate
            ? Math.round(a.average_heartrate)
            : null,
          total_elevation_gain: a.total_elevation_gain
            ? Math.round(a.total_elevation_gain)
            : 0,
          suffer_score: a.suffer_score || 0,
        }));
    }
  }

  const ttStyle = { backgroundColor: "#1e293b", border: "1px solid #475569" };
  const labelStyle = { color: "#cbd5e1" };
  const xFormatter = (v) =>
    typeof v === "string" && v.length === 10 ? v.slice(5) : v;

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="text-gray-500 dark:text-slate-500 text-sm text-center py-8">
          No data available
        </div>
      );
    }
    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={ttStyle} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    const yAxisProps = {
      tick: { fill: "#94a3b8", fontSize: 10 },
      ...(yAxisMin != null
        ? { domain: [yAxisMin, yAxisMax ?? "auto"] }
        : yAxisMax != null
          ? { domain: ["auto", yAxisMax] }
          : {}),
    };
    const xAxisProps = {
      tick: { fill: "#94a3b8", fontSize: 10 },
      tickFormatter: xFormatter,
      ...(xAxisMin != null || xAxisMax != null
        ? { domain: [xAxisMin ?? "auto", xAxisMax ?? "auto"] }
        : {}),
    };

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} {...xAxisProps} interval="preserveStartEnd" />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={ttStyle} labelStyle={labelStyle} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color || CHART_COLORS[0]}
                name={s.name || s.key}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} {...xAxisProps} interval={13} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={ttStyle} labelStyle={labelStyle} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color || CHART_COLORS[0]}
                fill={`${s.color || CHART_COLORS[0]}25`}
                name={s.name || s.key}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    // default: line
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} {...xAxisProps} interval={13} />
          <YAxis {...yAxisProps} />
          <Tooltip contentStyle={ttStyle} labelStyle={labelStyle} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color || CHART_COLORS[0]}
              dot={false}
              strokeWidth={2}
              name={s.name || s.key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-200 text-sm flex items-center gap-2">
          <span className="text-xs text-purple-400 font-normal bg-purple-400/10 px-1.5 py-0.5 rounded">
            AI
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}

// ─── Smart Dashboard Tab ──────────────────────────────────────────────────────

const SPLIT_COLORS = [
  "#60a5fa",
  "#fb923c",
  "#4ade80",
  "#f472b6",
  "#a78bfa",
  "#34d399",
];

const DEFAULT_PANELS = [
  "training-load",
  "ppi",
  "activity-split",
  "health-calendar",
  "training-log",
];

function SmartDashboardTab() {
  const [trainingLoad, setTrainingLoad] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState(DEFAULT_PANELS);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        'Hi! I can help you understand your training and customize these visualizations. Try asking: "What\'s my current form?" or "Show only training load and PPI".',
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/insights/training-load").catch(() => ({ data: [] })),
      api.get("/insights/activities?per_page=50").catch(() => ({ data: [] })),
    ])
      .then(([loadRes, actRes]) => {
        setTrainingLoad(loadRes.data);
        setActivities(actRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    const userMsg = { role: "user", content: msg };
    // Add user message + empty assistant placeholder immediately
    setChatMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "" },
    ]);
    setChatLoading(true);

    try {
      const loc = window.location;
      const apiBase = `${loc.protocol}//${loc.hostname}${loc.hostname === "localhost" ? ":8123/api" : "/api"}`;
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiBase}/insights/smart-dashboard/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: msg,
          // Send prior history only (not the current turn — backend appends it)
          history: chatMessages.slice(-8),
          config: { panels },
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              setChatMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                msgs[msgs.length - 1] = {
                  ...last,
                  content: last.content + event.delta,
                };
                return msgs;
              });
            } else if (event.type === "tool") {
              setChatMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = {
                  role: "assistant",
                  content: event.message,
                };
                return msgs;
              });
              setPanels(event.panels);
            } else if (event.type === "error") {
              setChatMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = {
                  role: "assistant",
                  content: "Sorry, something went wrong. Please try again.",
                };
                return msgs;
              });
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch {
      setChatMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return msgs;
      });
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingCards count={3} />;

  const latest =
    [...trainingLoad].reverse().find((d) => d.tsb != null) ??
    trainingLoad[trainingLoad.length - 1];
  const chartData = trainingLoad.slice(-90).map((d) => ({
    date: d.date,
    CTL: d.ctl ? +d.ctl.toFixed(1) : null,
    ATL: d.atl ? +d.atl.toFixed(1) : null,
    TSB: d.tsb ? +d.tsb.toFixed(1) : null,
  }));

  const sportCounts = {};
  activities.forEach((a) => {
    const type = (a.sport_type || a.type || "Other").replace(/_/g, " ");
    sportCounts[type] = (sportCounts[type] || 0) + 1;
  });
  const splitData = Object.entries(sportCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const renderPanel = (panel, i) => {
    if (typeof panel !== "string") {
      return (
        <CustomChartPanel
          key={panel.id || `custom-${i}`}
          config={panel}
          trainingLoad={trainingLoad}
          activities={activities}
        />
      );
    }
    switch (panel) {
      case "training-load":
        return (
          <Card
            key="training-load"
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-200 text-sm">
                Training Load — CTL / ATL / TSB
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      tickFormatter={(d) => d?.slice(5)}
                      interval={13}
                    />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                      labelStyle={{ color: "#cbd5e1" }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="CTL"
                      stroke="#60a5fa"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ATL"
                      stroke="#fb923c"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="TSB"
                      stroke="#4ade80"
                      dot={false}
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 dark:text-slate-500 text-sm text-center py-8">
                  Connect Intervals.icu to see training load
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "ppi":
        return (
          <Card
            key="ppi"
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-slate-200 text-sm">
                Peak Performance Indicator
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-slate-500">
                How rested you are right now
              </p>
            </CardHeader>
            <CardContent className="flex items-center gap-6 pt-2">
              <PPIGauge tsb={latest?.tsb} />
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-slate-500">
                    CTL
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {latest?.ctl?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-xs text-slate-600">Fitness</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-slate-500">
                    ATL
                  </div>
                  <div className="text-lg font-bold text-orange-400">
                    {latest?.atl?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-xs text-slate-600">Fatigue</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-slate-500">
                    TSB
                  </div>
                  <div className={`text-lg font-bold ${tsbColor(latest?.tsb)}`}>
                    {latest?.tsb?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-xs text-slate-600">Form</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "activity-split":
        return (
          <Card
            key="activity-split"
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-slate-200 text-sm">
                Activity Split
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-slate-500">
                Recent training by sport
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {splitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={splitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {splitData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={SPLIT_COLORS[idx % SPLIT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 dark:text-slate-500 text-sm text-center py-8">
                  No activity data
                </div>
              )}
            </CardContent>
          </Card>
        );
      case "health-calendar":
        return (
          <Card
            key="health-calendar"
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-200 text-sm">
                Training Calendar
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-slate-500">
                Last 13 weeks — darker = more sessions
              </p>
            </CardHeader>
            <CardContent>
              <HealthCalendar activities={activities} />
            </CardContent>
          </Card>
        );
      case "training-log":
        return (
          <Card
            key="training-log"
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-200 text-sm">
                Training Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {activities.slice(0, 8).map((a, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {sportIcon(a.sport_type || a.type)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {a.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-500">
                            {new Date(a.start_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-700 dark:text-slate-300">
                          {formatDistance(a.distance)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-500">
                          {formatDuration(a.moving_time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-slate-500 text-sm text-center py-8 px-5">
                  No recent activities found.
                </div>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="mt-4 flex gap-4 relative"
      style={{ height: "calc(100vh - 200px)", minHeight: 600 }}
    >
      {/* ── Left: Visualizations ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-slate-500">
            Chat to add, remove, or create charts
          </span>
          <div className="flex items-center gap-2">
            {/* Mobile Assistant Toggle */}
            <button
              onClick={() => setShowAssistant(!showAssistant)}
              className="lg:hidden text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 px-3 py-1 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>💬</span>
              <span>{showAssistant ? "Hide" : "Show"} Assistant</span>
            </button>
            <button
              onClick={() => setPanels(DEFAULT_PANELS)}
              className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Reset Dashboard
            </button>
          </div>
        </div>

        {(() => {
          const rows = [];
          let i = 0;
          while (i < panels.length) {
            const cur = panels[i];
            const next = panels[i + 1];
            if (
              (cur === "activity-split" && next === "health-calendar") ||
              (cur === "health-calendar" && next === "activity-split")
            ) {
              rows.push(
                <div key={`pair-${i}`} className="grid grid-cols-2 gap-4">
                  {renderPanel(cur, i)}
                  {renderPanel(next, i + 1)}
                </div>,
              );
              i += 2;
            } else {
              rows.push(renderPanel(cur, i));
              i++;
            }
          }
          return rows;
        })()}

        {panels.length === 0 && (
          <div className="text-center py-20 text-gray-500 dark:text-slate-500">
            <div className="text-4xl mb-3">📊</div>
            <div>No panels visible — ask the assistant to add some!</div>
          </div>
        )}
      </div>

      {/* ── Right: Chat UI ── */}
      <div
        className={`
        ${showAssistant ? "flex" : "hidden"} lg:flex
        w-full lg:w-72
        flex-col bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700
        lg:shrink-0
        fixed lg:relative
        inset-0 lg:inset-auto
        z-50 lg:z-auto
        m-4 lg:m-0
      `}
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-slate-200">
              Dashboard Assistant
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-500">
              Ask questions or change visualizations
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setShowAssistant(false)}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
            aria-label="Close assistant"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-snug ${
                  msg.role === "user"
                    ? "bg-tdc-purple text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2.5 flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Ask about your training..."
              disabled={chatLoading}
              className="flex-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-tdc-purple disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="px-3 py-2 bg-tdc-purple hover:bg-tdc-purple-dark disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 text-white rounded-lg text-sm transition-colors"
            >
              ↑
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              "What's my form?",
              "Show all panels",
              "Training load only",
              "Write a social media post",
              "Plot my longest runs",
              "Show me CTL",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setChatInput(s)}
                className="text-xs bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-400 px-2 py-1 rounded transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile when assistant is open */}
      {showAssistant && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Performance Insights
        </h1>
        <Tabs defaultValue="smart">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-full justify-start md:justify-center">
            <TabsTrigger value="smart">Smart Dashboard</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="training-load">Training Load</TabsTrigger>
            <TabsTrigger value="power">Power Analysis</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
            <TabsTrigger value="tdc">TDC Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <ActivityFeedTab />
          </TabsContent>
          <TabsContent value="training-load">
            <TrainingLoadTab />
          </TabsContent>
          <TabsContent value="power">
            <PowerAnalysisTab />
          </TabsContent>
          <TabsContent value="ai">
            <AIInsightsTab />
          </TabsContent>
          <TabsContent value="smart">
            <SmartDashboardTab />
          </TabsContent>
          <TabsContent value="tdc">
            <TDCInsightsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
