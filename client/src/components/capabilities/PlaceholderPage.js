import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const PlaceholderPage = ({ title, description, icon }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-3">
          {icon && (
            <span className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400">
              {icon}
            </span>
          )}
          {title}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>

      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            This feature is under development. Check back soon for updates.
          </p>
          <div className="flex gap-3">
            <Button
              disabled
              className="bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
            >
              Configure
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://developer.watson-orchestrate.ibm.com/",
                  "_blank",
                )
              }
              className="border-neutral-300 dark:border-neutral-700"
            >
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-sidecar-indigo-50 to-sidecar-violet-50 dark:from-sidecar-indigo-950 dark:to-sidecar-violet-950 border-sidecar-indigo-200 dark:border-sidecar-indigo-800">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            About This Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 dark:text-neutral-300">
            This capability is part of the Watson Orchestrate ADK toolkit.
            Sidecar is being developed to provide a comprehensive interface for
            all Watson Orchestrate development needs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;

// Made with Bob
