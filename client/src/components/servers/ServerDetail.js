import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import ServerLogsViewer from "./ServerLogsViewer";
import IntegrationSetupWizard from "../orchestrate/IntegrationSetupWizard";
import {
  useServer,
  useServerStatus,
  useServerActions,
} from "../../hooks/useServers";

const ServerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { server, loading, error, refetch } = useServer(id);
  const { status } = useServerStatus(id);
  const {
    startServer,
    stopServer,
    loading: actionLoading,
  } = useServerActions();
  const [showIntegrationWizard, setShowIntegrationWizard] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStart = async () => {
    try {
      await startServer(id);
      showToast("Server started successfully");
      refetch();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleStop = async () => {
    try {
      await stopServer(id);
      showToast("Server stopped successfully");
      refetch();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 flex-grow">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 flex-grow">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-900 dark:text-red-200">
                {error || "Server not found"}
              </p>
              <Button
                onClick={() => navigate("/servers")}
                variant="outline"
                className="mt-4"
              >
                Back to Servers
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isRunning = server.status === "running";
  const canStart = server.status === "stopped" || server.status === "created";

  if (showIntegrationWizard) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-6 flex-grow">
          <IntegrationSetupWizard
            server={server}
            onClose={() => setShowIntegrationWizard(false)}
            onSuccess={() => {
              showToast("Agent import initiated successfully");
              setShowIntegrationWizard(false);
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/servers")}
              className="mb-2 border-neutral-300 dark:border-neutral-700"
            >
              ← Back to Servers
            </Button>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {server.name}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
              {server.description || "No description"}
            </p>
          </div>
          <div className="flex gap-2">
            {canStart && (
              <Button
                onClick={handleStart}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {actionLoading ? "Starting..." : "Start Server"}
              </Button>
            )}
            {isRunning && (
              <>
                <Button
                  onClick={() => setShowIntegrationWizard(true)}
                  className="bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white font-semibold"
                >
                  Import to Orchestrate
                </Button>
                <Button
                  onClick={handleStop}
                  disabled={actionLoading}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 font-semibold"
                >
                  {actionLoading ? "Stopping..." : "Stop Server"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Server Info Card */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 mb-6">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-100">
              Server Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-mono">
                  Status
                </div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono ${
                      isRunning
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <span className={isRunning ? "animate-pulse" : ""}>
                      {isRunning ? "●" : "○"}
                    </span>{" "}
                    {server.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-mono">
                  Port
                </div>
                <div className="font-mono text-neutral-900 dark:text-neutral-100 mt-1 font-semibold">
                  {server.port || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-mono">
                  PID
                </div>
                <div className="font-mono text-neutral-900 dark:text-neutral-100 mt-1 font-semibold">
                  {server.pid || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-mono">
                  Created
                </div>
                <div className="text-neutral-900 dark:text-neutral-100 mt-1">
                  {new Date(server.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide font-mono">
                Endpoint URL
              </div>
              <div className="font-mono text-sm text-neutral-900 dark:text-neutral-100 break-all bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded border border-neutral-200 dark:border-neutral-700">
                {server.copilot_base_url}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <ServerLogsViewer serverId={id} />
          </TabsContent>

          <TabsContent value="config">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-neutral-100">
                  Agent Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wide font-mono">
                    Agent Name
                  </div>
                  <div className="text-neutral-900 dark:text-neutral-100 mt-1 font-mono">
                    {server.agent_name || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wide font-mono">
                    Description
                  </div>
                  <div className="text-neutral-900 dark:text-neutral-100 mt-1">
                    {server.agent_description || "—"}
                  </div>
                </div>
                {server.agent_tags && server.agent_tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide font-mono">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {server.agent_tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-950 text-sidecar-indigo-800 dark:text-sidecar-indigo-200 rounded text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-neutral-100">
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  Metrics coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ServerDetail;

// Made with Bob
