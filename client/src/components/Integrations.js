import React, { useState, useEffect } from "react";
import api from "../utilities/api";
import Header from "./Header";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const Integrations = () => {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Fetch recent Orchestrate commands/integrations
    const fetchCommands = async () => {
      try {
        // This would fetch from an endpoint like /api/orchestrate/commands
        // For now, we'll show a placeholder
        setCommands([]);
      } catch (err) {
        console.error("Failed to fetch commands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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

      <div className="container mx-auto px-4 py-6 max-w-4xl flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Orchestrate Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            View and manage your Watsonx Orchestrate agent imports
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              🔗 Import A2A Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 mb-4">
              To import an A2A server as a collaborator agent in Watsonx
              Orchestrate, go to the server detail page and click "Import to
              Orchestrate".
            </p>
            <Button
              onClick={() => (window.location.href = "/servers")}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              View Servers
            </Button>
          </CardContent>
        </Card>

        {/* Recent Import Commands */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Recent Import Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : commands.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No import commands yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Import your first A2A server to Orchestrate to see command
                  history here
                </p>
                <Button
                  onClick={() => (window.location.href = "/servers")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Servers
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {commands.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {cmd.command_type} - {cmd.server_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(cmd.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cmd.status)}`}
                      >
                        {cmd.status}
                      </span>
                    </div>
                    {cmd.output && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {cmd.output}
                      </div>
                    )}
                    {cmd.error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                        {cmd.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              How Orchestrate Integration Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Create & Start A2A Server
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your Copilot bridge server and ensure it's running
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Choose Import Method
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select ADK-based import (recommended) or REST API import
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Configure Credentials
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide Orchestrate instance URL and authentication details
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Import & Test
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Agent is registered in Orchestrate and ready to use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Integrations;

// Made with Bob
