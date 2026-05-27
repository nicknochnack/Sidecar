import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useWebSocket } from "../../hooks/useWebSocket";

const ServerLogsViewer = ({ serverId }) => {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const { data, isConnected } = useWebSocket(
    serverId ? `/api/servers/${serverId}/logs` : null,
  );

  useEffect(() => {
    if (data) {
      setLogs((prev) => [...prev, data].slice(-500)); // Keep last 500 logs
    }
  }, [data]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "error":
        return "text-red-400";
      case "warn":
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-neutral-900 dark:text-neutral-100">
              Server Logs
            </CardTitle>
            <span
              className={`text-xs px-2 py-1 rounded-full font-mono ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {isConnected ? "● Connected" : "○ Disconnected"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={
                autoScroll
                  ? "bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950 border-sidecar-indigo-300 dark:border-sidecar-indigo-700"
                  : "border-neutral-300 dark:border-neutral-700"
              }
            >
              {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="border-neutral-300 dark:border-neutral-700"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-neutral-950 dark:bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm border border-neutral-800 dark:border-neutral-900">
          {logs.length === 0 ? (
            <div className="text-neutral-500 dark:text-neutral-600 text-center py-8">
              {isConnected
                ? "Waiting for logs..."
                : "Connect to server to view logs"}
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-neutral-600 dark:text-neutral-500 shrink-0">
                    {log.timestamp || new Date().toISOString().substr(11, 8)}
                  </span>
                  <span
                    className={`shrink-0 font-semibold uppercase w-12 ${getLogLevelColor(log.level)}`}
                  >
                    {log.level || "INFO"}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-400 break-all">
                    {log.message || JSON.stringify(log)}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerLogsViewer;

// Made with Bob
