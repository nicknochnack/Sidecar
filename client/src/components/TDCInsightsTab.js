import React, { useState, useEffect } from "react";
import api from "../utilities/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDistance(meters) {
  if (!meters) return "0 km";
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

// ─── Loading & Error Components ──────────────────────────────────────────────

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}

function ErrorCard({ message }) {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardContent className="pt-6">
        <p className="text-red-600 dark:text-red-400">{message}</p>
      </CardContent>
    </Card>
  );
}

// ─── Peloton Selection (User View) ───────────────────────────────────────────

function PelotonSelection({ currentPeloton, onUpdate }) {
  const [pelotons, setPelotons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPelotons();
  }, []);

  const loadPelotons = async () => {
    try {
      const res = await api.get("/tdc/pelotons");
      setPelotons(res.data);
    } catch (error) {
      console.error("Failed to load pelotons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (pelotonId) => {
    try {
      await api.post("/tdc/join-peloton", { peloton_id: pelotonId });
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to join peloton");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave your peloton?")) return;
    try {
      await api.delete("/tdc/leave-peloton");
      onUpdate();
    } catch (error) {
      alert("Failed to leave peloton");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post("/tdc/sync-activities");
      alert(
        `Synced ${res.data.synced} TDC activities (${res.data.total} total activities checked)`,
      );
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to sync activities");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Peloton</CardTitle>
        </CardHeader>
        <CardContent>
          {currentPeloton ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: currentPeloton.color }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentPeloton.name}
                  </h3>
                  {currentPeloton.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentPeloton.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleLeave}
                variant="outline"
                className="w-full"
              >
                Leave Peloton
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Select a peloton to join:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pelotons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleJoin(p.id)}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {p.rider_count} riders
                        {p.max_riders && ` / ${p.max_riders} max`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync TDC Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sync your Intervals.icu activities that include #tdc and #day1,
            #day2, or #day3 hashtags.
          </p>
          <Button onClick={handleSync} disabled={syncing} className="w-full">
            {syncing ? "Syncing..." : "Sync Activities"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── User Activities View ────────────────────────────────────────────────────

function UserActivitiesView() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("all");

  useEffect(() => {
    loadActivities();
  }, [selectedDay]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const endpoint =
        selectedDay === "all"
          ? "/tdc/activities"
          : `/tdc/activities/${selectedDay}`;
      const res = await api.get(endpoint);
      setActivities(res.data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard />;

  const stats = activities.reduce(
    (acc, act) => {
      acc.totalDistance += Number(act.distance) || 0;
      acc.totalElevation += Number(act.total_elevation_gain) || 0;
      acc.totalTime += Number(act.moving_time) || 0;
      return acc;
    },
    { totalDistance: 0, totalElevation: 0, totalTime: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["all", "1", "2", "3"].map((day) => (
          <Button
            key={day}
            onClick={() => setSelectedDay(day)}
            variant={selectedDay === day ? "default" : "outline"}
            size="sm"
          >
            {day === "all" ? "All Days" : `Day ${day}`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatDistance(stats.totalDistance)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Distance
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Number(stats.totalElevation || 0).toFixed(0)}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Elevation
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatDuration(stats.totalTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Time
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No activities found. Make sure to add #tdc and #day1, #day2, or
              #day3 to your Intervals.icu activity descriptions, then sync.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {act.activity_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Day {act.day} • {formatDistance(act.distance)} •{" "}
                      {formatDuration(act.moving_time)}
                      {act.average_watts &&
                        ` • ${Math.round(act.average_watts)}w avg`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(act.activity_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Win Insights (AI) ───────────────────────────────────────────────────────

function WinInsights() {
  const [category, setCategory] = useState("distance");
  const [day, setDay] = useState("");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/tdc/win-insights", {
        category,
        day: day || null,
      });
      setInsights(res.data);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Win Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="distance">Distance</option>
              <option value="elevation">Elevation</option>
              <option value="power">Power</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Day (optional)
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Overall</option>
              <option value="1">Day 1</option>
              <option value="2">Day 2</option>
              <option value="3">Day 3</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Win Strategy"}
          </Button>
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Your Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {insights.insights}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your Distance
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatDistance(insights.your_stats.distance)}
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your Elevation
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {Number(insights.your_stats.elevation || 0).toFixed(0)}m
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your Avg Power
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {Number(insights.your_stats.avg_power || 0).toFixed(0)}w
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Admin Overview ──────────────────────────────────────────────────────────

function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const res = await api.get("/tdc/admin/overview");
      setOverview(res.data);
    } catch (error) {
      console.error("Failed to load overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard />;
  if (!overview) return <ErrorCard message="Failed to load overview" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {overview.total_riders}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Riders
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {overview.total_activities}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Activities
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatDistance(overview.total_distance)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Distance
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overview.day_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="activity_count"
                  fill="#3b82f6"
                  name="Activities"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distance by Peloton</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={overview.peloton_stats}
                  dataKey="total_distance"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {overview.peloton_stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Admin Peloton Comparison ────────────────────────────────────────────────

function AdminPelotonComparison() {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    loadComparison();
  }, [selectedDay]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const params = selectedDay ? { day: selectedDay } : {};
      const res = await api.get("/tdc/admin/peloton-comparison", { params });

      console.log("Raw peloton data:", res.data);

      // Aggregate data by peloton
      const aggregated = res.data.reduce((acc, row) => {
        const key = row.id;
        if (!acc[key]) {
          acc[key] = {
            id: row.id,
            name: row.name,
            color: row.color,
            ride_count: 0,
            total_distance: 0,
            total_watts_sum: 0,
            watts_count: 0,
          };
        }

        const rideCount = parseInt(row.ride_count) || 0;
        acc[key].ride_count += rideCount;
        acc[key].total_distance += parseFloat(row.total_distance) || 0;

        if (row.avg_watts) {
          acc[key].total_watts_sum += parseFloat(row.avg_watts) * rideCount;
          acc[key].watts_count += rideCount;
        }

        return acc;
      }, {});

      console.log("Aggregated peloton data:", aggregated);

      // Convert to array and calculate averages
      const result = Object.values(aggregated).map((p) => ({
        ...p,
        avg_distance: p.ride_count > 0 ? p.total_distance / p.ride_count : 0,
        avg_watts: p.watts_count > 0 ? p.total_watts_sum / p.watts_count : null,
      }));

      console.log("Final peloton result:", result);

      setComparison(result);
    } catch (error) {
      console.error("Failed to load comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["", "1", "2", "3"].map((day) => (
          <Button
            key={day}
            onClick={() => setSelectedDay(day)}
            variant={selectedDay === day ? "default" : "outline"}
            size="sm"
          >
            {day === "" ? "All Days" : `Day ${day}`}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peloton Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Peloton</th>
                  <th className="text-right p-2">Rides</th>
                  <th className="text-right p-2">Total Distance</th>
                  <th className="text-right p-2">Avg Distance</th>
                  <th className="text-right p-2">Avg Power</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        {row.name}
                      </div>
                    </td>
                    <td className="text-right p-2">{row.ride_count}</td>
                    <td className="text-right p-2">
                      {formatDistance(row.total_distance)}
                    </td>
                    <td className="text-right p-2">
                      {formatDistance(row.avg_distance)}
                    </td>
                    <td className="text-right p-2">
                      {row.avg_watts ? `${Math.round(row.avg_watts)}w` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin Rider Comparison ──────────────────────────────────────────────────

function AdminRiderComparison() {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    loadComparison();
  }, [selectedDay]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const params = selectedDay ? { day: selectedDay } : {};
      const res = await api.get("/tdc/admin/rider-comparison", { params });

      console.log("Raw rider data:", res.data);

      // Aggregate data by rider (user_id)
      const aggregated = res.data.reduce((acc, row) => {
        const key = row.user_id;
        if (!acc[key]) {
          acc[key] = {
            user_id: row.user_id,
            email: row.email,
            peloton_name: row.peloton_name,
            ride_count: 0,
            total_distance: 0,
            total_elevation: 0,
            total_watts_sum: 0,
            watts_count: 0,
          };
        }

        const rideCount = parseInt(row.ride_count) || 0;
        acc[key].ride_count += rideCount;
        acc[key].total_distance += parseFloat(row.total_distance) || 0;
        acc[key].total_elevation += parseFloat(row.total_elevation) || 0;

        // avg_watts from backend is already averaged per day/peloton group
        // We need to weight it by ride count to get proper overall average
        if (row.avg_watts) {
          acc[key].total_watts_sum += parseFloat(row.avg_watts) * rideCount;
          acc[key].watts_count += rideCount;
        }

        return acc;
      }, {});

      console.log("Aggregated rider data:", aggregated);

      // Convert to array and calculate averages, sort by total distance
      const result = Object.values(aggregated)
        .map((r) => ({
          ...r,
          avg_watts:
            r.watts_count > 0 ? r.total_watts_sum / r.watts_count : null,
        }))
        .sort((a, b) => b.total_distance - a.total_distance);

      console.log("Final rider result:", result);

      setComparison(result);
    } catch (error) {
      console.error("Failed to load comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["", "1", "2", "3"].map((day) => (
          <Button
            key={day}
            onClick={() => setSelectedDay(day)}
            variant={selectedDay === day ? "default" : "outline"}
            size="sm"
          >
            {day === "" ? "All Days" : `Day ${day}`}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rider Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rider</th>
                  <th className="text-left p-2">Peloton</th>
                  <th className="text-right p-2">Rides</th>
                  <th className="text-right p-2">Total Distance</th>
                  <th className="text-right p-2">Avg Power</th>
                  <th className="text-right p-2">Total Elevation</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.peloton_name || "—"}</td>
                    <td className="text-right p-2">{row.ride_count}</td>
                    <td className="text-right p-2">
                      {formatDistance(row.total_distance)}
                    </td>
                    <td className="text-right p-2">
                      {row.avg_watts ? `${Math.round(row.avg_watts)}w` : "—"}
                    </td>
                    <td className="text-right p-2">
                      {Math.round(row.total_elevation)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Admin Leaderboards & Awards ─────────────────────────────────────────────

function AdminLeaderboards() {
  const [leaderboards, setLeaderboards] = useState(null);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedDay]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = selectedDay ? { day: selectedDay } : {};
      const [leaderRes, awardsRes] = await Promise.all([
        api.get("/tdc/admin/leaderboards", { params }),
        api.get("/tdc/awards"),
      ]);
      setLeaderboards(leaderRes.data);
      setAwards(awardsRes.data);
    } catch (error) {
      console.error("Failed to load leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAwards = async () => {
    setCalculating(true);
    try {
      const body = selectedDay ? { day: parseInt(selectedDay) } : {};
      await api.post("/tdc/admin/calculate-awards", body);
      alert("Awards calculated successfully!");
      loadData();
    } catch (error) {
      alert("Failed to calculate awards");
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {["", "1", "2", "3"].map((day) => (
            <Button
              key={day}
              onClick={() => setSelectedDay(day)}
              variant={selectedDay === day ? "default" : "outline"}
              size="sm"
            >
              {day === "" ? "All Days" : `Day ${day}`}
            </Button>
          ))}
        </div>
        <Button onClick={handleCalculateAwards} disabled={calculating}>
          {calculating ? "Calculating..." : "Calculate Awards"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Distance Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboards?.distance.map((rider, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">#{i + 1}</span>{" "}
                    {rider.email}
                  </div>
                  <div className="text-sm">
                    {formatDistance(rider.total_distance)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⛰️ Elevation Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboards?.elevation.map((rider, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">#{i + 1}</span>{" "}
                    {rider.email}
                  </div>
                  <div className="text-sm">
                    {Math.round(rider.total_elevation)}m
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Power Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboards?.power.map((rider, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">#{i + 1}</span>{" "}
                    {rider.email}
                  </div>
                  <div className="text-sm">{Math.round(rider.avg_watts)}w</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {awards.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No awards calculated yet. Click "Calculate Awards" to generate
                them.
              </p>
            ) : (
              awards.map((award, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-semibold">
                      {award.category.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {award.award_type === "individual"
                        ? award.user_email
                        : award.peloton_name}
                      {award.day && ` • Day ${award.day}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {award.unit === "meters" &&
                      award.category.includes("distance")
                        ? formatDistance(award.value)
                        : `${parseFloat(award.value).toFixed(0)}${award.unit === "meters" ? "m" : award.unit === "watts" ? "w" : ""}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main TDC Insights Tab ───────────────────────────────────────────────────

function TDCInsightsTab() {
  const [currentPeloton, setCurrentPeloton] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [pelotonRes, userRes] = await Promise.all([
        api.get("/tdc/my-peloton"),
        api.get("/auth/me"),
      ]);
      setCurrentPeloton(pelotonRes.data);
      setIsAdmin(userRes.data.user?.is_admin || false);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="space-y-6 mt-4">
      <Tabs defaultValue={isAdmin ? "admin-overview" : "peloton"}>
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {!isAdmin && (
            <>
              <TabsTrigger value="peloton">My Peloton</TabsTrigger>
              <TabsTrigger value="activities">My Activities</TabsTrigger>
              <TabsTrigger value="win-insights">Win Strategy</TabsTrigger>
            </>
          )}
          {isAdmin && (
            <>
              <TabsTrigger value="admin-overview">Overview</TabsTrigger>
              <TabsTrigger value="admin-pelotons">
                Peloton Comparison
              </TabsTrigger>
              <TabsTrigger value="admin-riders">Rider Comparison</TabsTrigger>
              <TabsTrigger value="admin-awards">
                Leaderboards & Awards
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {!isAdmin && (
          <>
            <TabsContent value="peloton">
              <PelotonSelection
                currentPeloton={currentPeloton}
                onUpdate={loadUserData}
              />
            </TabsContent>
            <TabsContent value="activities">
              <UserActivitiesView />
            </TabsContent>
            <TabsContent value="win-insights">
              <WinInsights />
            </TabsContent>
          </>
        )}

        {isAdmin && (
          <>
            <TabsContent value="admin-overview">
              <AdminOverview />
            </TabsContent>
            <TabsContent value="admin-pelotons">
              <AdminPelotonComparison />
            </TabsContent>
            <TabsContent value="admin-riders">
              <AdminRiderComparison />
            </TabsContent>
            <TabsContent value="admin-awards">
              <AdminLeaderboards />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default TDCInsightsTab;

// Made with Bob
