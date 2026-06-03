import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const ActivityFeed = () => {
  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "server_started",
      title: "Server Started",
      description: "Copilot Mock Data A2A Server",
      user: "You",
      timestamp: "2 minutes ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      id: 2,
      type: "integration_added",
      title: "Integration Connected",
      description: "Azure Agent Foundry linked to production environment",
      user: "System",
      timestamp: "15 minutes ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 3,
      type: "evaluation_completed",
      title: "Evaluation Completed",
      description: "Red teaming test passed with 94% success rate",
      user: "Evaluation Engine",
      timestamp: "1 hour ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: 4,
      type: "knowledge_base_updated",
      title: "Knowledge Base Updated",
      description: "Added 127 new documents to Central Knowledge Base",
      user: "You",
      timestamp: "2 hours ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      id: 5,
      type: "server_created",
      title: "Server Created",
      description: "New A2A server provisioned for AWS Bedrock",
      user: "You",
      timestamp: "3 hours ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      color: "text-sidecar-indigo-600 dark:text-sidecar-indigo-400",
      bgColor: "bg-sidecar-indigo-100 dark:bg-sidecar-indigo-900/30",
    },
    {
      id: 6,
      type: "deployment",
      title: "Model Deployed",
      description: "GPT-4 model deployed to production environment",
      user: "System",
      timestamp: "5 hours ago",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      id: 7,
      type: "trace_analyzed",
      title: "Trace Analysis Complete",
      description: "Analyzed 1,247 execution traces for performance insights",
      user: "Analytics Engine",
      timestamp: "Yesterday",
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
  ];

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400 hover:text-sidecar-indigo-700 dark:hover:text-sidecar-indigo-300"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex gap-4 pb-4 ${
                index !== activities.length - 1
                  ? "border-b border-neutral-200 dark:border-neutral-800"
                  : ""
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg ${activity.bgColor} ${activity.color} flex items-center justify-center`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500 whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    by {activity.user}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            variant="outline"
            className="w-full border-neutral-300 dark:border-neutral-700 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500"
          >
            Load More Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;

// Made with Bob
