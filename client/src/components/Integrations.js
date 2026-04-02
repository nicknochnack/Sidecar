import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../utilities/api";
import Header from "./Header";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// ─── Intervals.icu card ───────────────────────────────────────────────────────

function IntervalsCard({ status, onConnect, onDisconnect, loading }) {
  const [apiKey, setApiKey] = useState("");
  const [athleteId, setAthleteId] = useState("");
  const [error, setError] = useState(null);
  const connected = status?.connected;

  const handleConnect = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onConnect(apiKey, athleteId);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Connection failed. Check your API key and athlete ID.",
      );
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <span className="text-2xl">🔵</span>
          Intervals.icu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connected ? (
          <>
            <div>
              <div className="text-gray-900 dark:text-gray-100 font-medium">
                {status.profile?.name || `Athlete ${status.athlete_id}`}
              </div>
              <div className="text-xs text-emerald-600 flex items-center gap-1">
                <span>●</span> Connected · ID: {status.athlete_id}
              </div>
            </div>
            <Button
              onClick={onDisconnect}
              disabled={loading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 w-full"
            >
              Disconnect Intervals.icu
            </Button>
          </>
        ) : (
          <form onSubmit={handleConnect} className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect Intervals.icu to unlock training load (CTL/ATL/TSB), power
              curves, and wellness tracking. Find your API key in{" "}
              <a
                href="https://intervals.icu/settings"
                target="_blank"
                rel="noreferrer"
                className="text-tdc-purple underline hover:text-tdc-purple-dark"
              >
                Intervals.icu Settings → API
              </a>
              .
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="athlete-id"
                className="text-gray-700 dark:text-gray-300"
              >
                Athlete ID
              </Label>
              <Input
                id="athlete-id"
                placeholder="e.g. i1234567"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Found in your Intervals.icu profile URL.
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="api-key"
                className="text-gray-700 dark:text-gray-300"
              >
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Your Intervals.icu API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? "Connecting…" : "Connect Intervals.icu"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Integrations page ───────────────────────────────────────────────────

function Integrations() {
  const [status, setStatus] = useState({ intervals_icu: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Fetch integration status
    api
      .get("/integrations/status")
      .then((r) => setStatus(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.search]);

  // ─── Intervals.icu handlers ────────────────────────────────────────────────

  const handleIntervalsConnect = async (apiKey, athleteId) => {
    setActionLoading(true);
    try {
      const res = await api.post("/integrations/intervals-icu", {
        api_key: apiKey,
        athlete_id: athleteId,
      });
      setStatus((s) => ({
        ...s,
        intervals_icu: {
          connected: true,
          athlete_id: res.data.athlete_id,
          profile: res.data.profile,
        },
      }));
      showToast("Intervals.icu connected successfully!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIntervalsDisconnect = async () => {
    setActionLoading(true);
    try {
      await api.delete("/integrations/intervals-icu");
      setStatus((s) => ({ ...s, intervals_icu: null }));
      showToast("Intervals.icu disconnected.");
    } catch (e) {
      showToast("Failed to disconnect Intervals.icu.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-2xl flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Connect Intervals.icu to unlock performance insights.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse" />
          </div>
        ) : (
          <IntervalsCard
            status={status.intervals_icu}
            onConnect={handleIntervalsConnect}
            onDisconnect={handleIntervalsDisconnect}
            loading={actionLoading}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Integrations;

// Made with Bob
