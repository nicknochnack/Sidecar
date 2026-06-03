import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const EnvironmentConnections = () => {
  // Mock data
  const environments = [
    { name: "Local", count: 3, color: "bg-blue-500", percentage: 30 },
    { name: "AWS", count: 5, color: "bg-orange-500", percentage: 50 },
    { name: "IBM SaaS", count: 2, color: "bg-purple-500", percentage: 20 },
  ];

  const total = environments.reduce((sum, env) => sum + env.count, 0);

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Environment Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Count */}
        <div className="text-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {total}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Total Environments
          </div>
        </div>

        {/* Visual Bar */}
        <div className="relative h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex">
          {environments.map((env, index) => (
            <div
              key={env.name}
              className={`${env.color} transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
              style={{ width: `${env.percentage}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {env.count}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-3">
          {environments.map((env) => (
            <div
              key={env.name}
              className="flex flex-col items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${env.color}`}></div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {env.name}
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {env.count}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {env.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* Status Indicators */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-neutral-600 dark:text-neutral-400">
                All systems operational
              </span>
            </div>
            <span className="text-neutral-500 dark:text-neutral-500 text-xs font-mono">
              Last updated: just now
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentConnections;

// Made with Bob
