import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "stopped":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "starting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return "●";
      case "stopped":
        return "○";
      case "error":
        return "✕";
      case "starting":
        return "◐";
      default:
        return "○";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      <span className="animate-pulse">{getStatusIcon()}</span>
      {status || "unknown"}
    </span>
  );
};

const ServerCard = ({ server, onStart, onStop, loading }) => {
  const navigate = useNavigate();
  const isRunning = server.status === "running";
  const canStart = server.status === "stopped" || server.status === "created";

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-gray-900 dark:text-gray-100 text-lg">
              {server.name}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {server.description || "No description"}
            </p>
          </div>
          <StatusBadge status={server.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Port:</span>
            <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
              {server.port || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">PID:</span>
            <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
              {server.pid || "—"}
            </span>
          </div>
        </div>

        {server.copilot_base_url && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            <span className="font-medium">Copilot:</span>{" "}
            {server.copilot_base_url}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate(`/servers/${server.id}`)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View Details
          </Button>
          {canStart && (
            <Button
              onClick={() => onStart(server.id)}
              disabled={loading}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Starting..." : "Start"}
            </Button>
          )}
          {isRunning && (
            <Button
              onClick={() => onStop(server.id)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
            >
              {loading ? "Stopping..." : "Stop"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerCard;

// Made with Bob
