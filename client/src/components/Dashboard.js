import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useServers } from "../hooks/useServers";

const Dashboard = () => {
  const navigate = useNavigate();
  const { servers, loading } = useServers();

  const runningServers = servers.filter((s) => s.status === "running").length;
  const stoppedServers = servers.filter((s) => s.status === "stopped").length;
  const totalServers = servers.length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome to Sidecar
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Provision A2A servers on the fly for watsonx Orchestrate integration
          </p>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              >
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-mono uppercase tracking-wide">
                  Total Servers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {totalServers}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  A2A bridge servers
                </p>
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
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Active connections
                </p>
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
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Inactive servers
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-sidecar-indigo-600 to-sidecar-violet-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create A2A Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sidecar-indigo-100 mb-4">
                Provision a new A2A server for watsonx Orchestrate in minutes
              </p>
              <Button
                onClick={() => navigate("/servers/create")}
                className="bg-white text-sidecar-indigo-600 hover:bg-neutral-50 font-semibold"
              >
                Create Server
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100 text-xl flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Manage Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                View, start, stop, and monitor your A2A servers
              </p>
              <Button
                onClick={() => navigate("/servers")}
                className="bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white"
              >
                View Servers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {totalServers === 0 && !loading && (
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100">
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Create an A2A Server
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Configure your agent metadata and connection details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Start the Server
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Launch your bridge server and verify it's running
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Import to watsonx Orchestrate
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Register your agent in watsonx Orchestrate via the
                    integration wizard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Servers */}
        {totalServers > 0 && !loading && (
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-neutral-900 dark:text-neutral-100">
                  Recent Servers
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/servers")}
                  className="border-neutral-300 dark:border-neutral-700 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servers.slice(0, 5).map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500 cursor-pointer transition-colors"
                    onClick={() => navigate(`/servers/${server.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 font-mono">
                        {server.name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                        Port: {server.port || "—"}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium font-mono ${
                        server.status === "running"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {server.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

// Made with Bob
