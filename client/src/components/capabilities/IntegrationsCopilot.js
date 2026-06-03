import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const IntegrationsCopilot = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Microsoft Copilot Integration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Connect your Watson Orchestrate agents to Microsoft Copilot
        </p>
      </div>

      <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            This feature is under development. You'll soon be able to integrate
            your Watson Orchestrate agents with Microsoft Copilot.
          </p>
          <Button disabled className="bg-neutral-300 dark:bg-neutral-700">
            Configure Integration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsCopilot;

// Made with Bob
