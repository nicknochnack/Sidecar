import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import ServerCard from "./ServerCard";
import { useServers, useServerActions } from "../../hooks/useServers";

const ServersDashboard = () => {
  const navigate = useNavigate();
  const { servers, loading, error, refetch } = useServers();
  const {
    startServer,
    stopServer,
    loading: actionLoading,
  } = useServerActions();
  const [actioningServerId, setActioningServerId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStart = async (serverId) => {
    setActioningServerId(serverId);
    try {
      await startServer(serverId);
      showToast("Server started successfully");
      refetch();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActioningServerId(null);
    }
  };

  const handleStop = async (serverId) => {
    setActioningServerId(serverId);
    try {
      await stopServer(serverId);
      showToast("Server stopped successfully");
      refetch();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActioningServerId(null);
    }
  };

  const runningServers = servers.filter((s) => s.status === "running").length;
  const stoppedServers = servers.filter((s) => s.status === "stopped").length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <Header />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-red-600 border-red-700 text-white"
              : "bg-emerald-600 border-emerald-700 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              A2A Servers
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
              Manage your Agent-to-Agent bridge servers for watsonx Orchestrate
            </p>
          </div>
          <Button
            onClick={() => navigate("/servers/create")}
            className="bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white font-semibold"
          >
            + Create Server
          </Button>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-mono uppercase tracking-wide">
                  Total Servers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {servers.length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-mono uppercase tracking-wide">
                  Running
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {runningServers}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-mono uppercase tracking-wide">
                  Stopped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-600 dark:text-neutral-400 font-mono">
                  {stoppedServers}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-900 dark:text-red-200">{error}</p>
              <Button onClick={refetch} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && servers.length === 0 && (
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-12 pb-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No servers yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Create your first A2A server to connect with watsonx Orchestrate
              </p>
              <Button
                onClick={() => navigate("/servers/create")}
                className="bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white font-semibold"
              >
                Create Your First Server
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Servers Grid */}
        {!loading && !error && servers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onStart={handleStart}
                onStop={handleStop}
                loading={actionLoading && actioningServerId === server.id}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServersDashboard;

// Made with Bob
