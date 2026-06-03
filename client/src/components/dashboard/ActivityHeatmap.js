import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const ActivityHeatmap = () => {
  // Generate mock data for the last 12 weeks (84 days)
  const generateMockData = () => {
    const data = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate random activity level (0-4)
      const level = Math.floor(Math.random() * 5);
      const count =
        level === 0 ? 0 : Math.floor(Math.random() * 50) + level * 10;

      data.push({
        date: date.toISOString().split("T")[0],
        count,
        level,
      });
    }
    return data;
  };

  const activityData = generateMockData();

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  const getColorClass = (level) => {
    switch (level) {
      case 0:
        return "bg-neutral-100 dark:bg-neutral-800";
      case 1:
        return "bg-sidecar-indigo-200 dark:bg-sidecar-indigo-900";
      case 2:
        return "bg-sidecar-indigo-400 dark:bg-sidecar-indigo-700";
      case 3:
        return "bg-sidecar-indigo-600 dark:bg-sidecar-indigo-500";
      case 4:
        return "bg-sidecar-indigo-800 dark:bg-sidecar-indigo-400";
      default:
        return "bg-neutral-100 dark:bg-neutral-800";
    }
  };

  const totalActivity = activityData.reduce((sum, day) => sum + day.count, 0);
  const avgDaily = Math.round(totalActivity / activityData.length);
  const maxDay = Math.max(...activityData.map((d) => d.count));

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Activity Overview
          </div>
          <div className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
            Last 12 weeks
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {totalActivity.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Total Requests
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {avgDaily}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Daily Average
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {maxDay}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Peak Day
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} hover:ring-2 hover:ring-sidecar-indigo-500 transition-all cursor-pointer group relative`}
                    title={`${day.date}: ${day.count} requests`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {day.date}: {day.count} requests
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Less
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
              ></div>
            ))}
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            More
          </span>
        </div>

        {/* Activity Types */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-neutral-600 dark:text-neutral-400">
              API Calls
            </span>
            <span className="ml-auto font-mono text-neutral-900 dark:text-neutral-100">
              {Math.floor(totalActivity * 0.6).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-neutral-600 dark:text-neutral-400">
              Commands
            </span>
            <span className="ml-auto font-mono text-neutral-900 dark:text-neutral-100">
              {Math.floor(totalActivity * 0.25).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-neutral-600 dark:text-neutral-400">
              Deployments
            </span>
            <span className="ml-auto font-mono text-neutral-900 dark:text-neutral-100">
              {Math.floor(totalActivity * 0.1).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-neutral-600 dark:text-neutral-400">
              Evaluations
            </span>
            <span className="ml-auto font-mono text-neutral-900 dark:text-neutral-100">
              {Math.floor(totalActivity * 0.05).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;

// Made with Bob
