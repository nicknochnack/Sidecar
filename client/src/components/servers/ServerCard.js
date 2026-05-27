import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "stopped":
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "starting":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300";
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
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium font-mono ${getStatusColor()}`}
    >
      <span className={status === "running" ? "animate-pulse" : ""}>
        {getStatusIcon()}
      </span>
      {status || "unknown"}
    </span>
  );
};

const ServerCard = ({ server, onStart, onStop, loading }) => {
  const navigate = useNavigate();
  const isRunning = server.status === "running";
  const canStart = server.status === "stopped" || server.status === "created";

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-neutral-900 dark:text-neutral-100 text-lg font-mono">
              {server.name}
            </CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {server.description || "No description"}
            </p>
          </div>
          <StatusBadge status={server.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
              Port:
            </span>
            <span className="ml-2 font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
              {server.port || "—"}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
              PID:
            </span>
            <span className="ml-2 font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
              {server.pid || "—"}
            </span>
          </div>
        </div>

        {server.copilot_base_url && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate font-mono bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
            <span className="font-medium">Endpoint:</span>{" "}
            {server.copilot_base_url}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate(`/servers/${server.id}`)}
            variant="outline"
            size="sm"
            className="flex-1 border-neutral-300 dark:border-neutral-700 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500"
          >
            View Details
          </Button>
          {canStart && (
            <Button
              onClick={() => onStart(server.id)}
              disabled={loading}
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
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
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 font-semibold"
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
