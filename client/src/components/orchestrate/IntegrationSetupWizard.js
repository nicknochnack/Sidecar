import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import api from "../../utilities/api";

const IntegrationSetupWizard = ({ server, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState("method");
  const [importMethod, setImportMethod] = useState(null);
  const [environment, setEnvironment] = useState("local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commandId, setCommandId] = useState(null);
  const [formData, setFormData] = useState({
    orchestrate_url: "",
    auth_token: "",
    push_endpoint: "",
    public_api_url: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/orchestrate/agents/import", {
        serverId: server.id,
        method: importMethod,
        environment: importMethod === "api" ? environment : undefined,
        ...formData,
      });
      setCommandId(response.data.command_id);
      setCurrentStep("status");
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to import agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100">
          Import to watsonx Orchestrate
        </CardTitle>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Register "<span className="font-mono">{server.name}</span>" as an
          agent in watsonx Orchestrate
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="method">Method</TabsTrigger>
            <TabsTrigger value="config" disabled={!importMethod}>
              Configure
            </TabsTrigger>
            <TabsTrigger value="status" disabled={!commandId}>
              Status
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Choose Import Method */}
          <TabsContent value="method" className="space-y-4">
            <div className="space-y-4">
              <div
                onClick={() => setImportMethod("adk")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  importMethod === "adk"
                    ? "border-sidecar-indigo-500 bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={importMethod === "adk"}
                    onChange={() => setImportMethod("adk")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      ADK-based Import (Recommended)
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Uses the Orchestrate ADK CLI to import the agent. Requires
                      ADK to be installed in your environment.
                    </p>
                    <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Command:{" "}
                      <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
                        uv run orchestrate agents import
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setImportMethod("api")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  importMethod === "api"
                    ? "border-sidecar-indigo-500 bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={importMethod === "api"}
                    onChange={() => setImportMethod("api")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      REST API Import
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Direct API call to Orchestrate to register the agent.
                      Requires Orchestrate API credentials.
                    </p>
                    <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Method:{" "}
                      <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
                        POST /api/agents
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 2: Configuration */}
          <TabsContent value="config" className="space-y-4">
            {importMethod === "adk" && (
              <div className="space-y-4">
                <div className="p-4 bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950 border border-sidecar-indigo-200 dark:border-sidecar-indigo-800 rounded-lg">
                  <p className="text-sm text-sidecar-indigo-900 dark:text-sidecar-indigo-200">
                    <strong>Prerequisites:</strong> Ensure the Orchestrate ADK
                    is installed and configured with your credentials.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push_endpoint">
                    Push Notification Endpoint (Optional)
                  </Label>
                  <Input
                    id="push_endpoint"
                    placeholder="https://your-orchestrate-instance.com/push"
                    value={formData.push_endpoint}
                    onChange={(e) =>
                      updateField("push_endpoint", e.target.value)
                    }
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Leave empty to auto-detect from ADK configuration
                  </p>
                </div>
              </div>
            )}

            {importMethod === "api" && (
              <div className="space-y-4">
                {/* Environment Selection */}
                <div className="space-y-2">
                  <Label>Deployment Environment *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setEnvironment("local")}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        environment === "local"
                          ? "border-sidecar-indigo-500 bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={environment === "local"}
                          onChange={() => setEnvironment("local")}
                        />
                        <div>
                          <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            Local
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            On-premise instance
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setEnvironment("aws")}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        environment === "aws"
                          ? "border-sidecar-indigo-500 bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={environment === "aws"}
                          onChange={() => setEnvironment("aws")}
                        />
                        <div>
                          <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            AWS
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Cloud instance
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AWS-specific info banner */}
                {environment === "aws" && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-900 dark:text-yellow-200">
                      <strong>AWS Deployment:</strong> Your agent must be
                      accessible via a public URL (e.g., using ngrok). The URL
                      format should be:{" "}
                      <code className="text-xs bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded">
                        https://api.{"{region}"}
                        .dl.watson-orchestrate.ibm.com/instances/
                        {"{instance-id}"}
                      </code>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="orchestrate_url">
                    Orchestrate Instance URL *
                  </Label>
                  <Input
                    id="orchestrate_url"
                    placeholder={
                      environment === "aws"
                        ? "https://api.ap-south-1.dl.watson-orchestrate.ibm.com/instances/your-instance-id"
                        : "https://your-orchestrate-instance.com"
                    }
                    value={formData.orchestrate_url}
                    onChange={(e) =>
                      updateField("orchestrate_url", e.target.value)
                    }
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {environment === "aws"
                      ? "Include the full path up to /instances/{instance-id}"
                      : "Base URL of your Orchestrate instance"}
                  </p>
                </div>

                {environment === "aws" && (
                  <div className="space-y-2">
                    <Label htmlFor="public_api_url">Public Agent URL *</Label>
                    <Input
                      id="public_api_url"
                      placeholder="https://your-agent.ngrok-free.dev"
                      value={formData.public_api_url}
                      onChange={(e) =>
                        updateField("public_api_url", e.target.value)
                      }
                      className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Public URL where your agent is accessible (e.g., ngrok
                      tunnel)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="auth_token">Authentication Token *</Label>
                  <Input
                    id="auth_token"
                    type="password"
                    placeholder="Your Orchestrate API token"
                    value={formData.auth_token}
                    onChange={(e) => updateField("auth_token", e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push_endpoint">
                    Push Notification Endpoint (Optional)
                  </Label>
                  <Input
                    id="push_endpoint"
                    placeholder="https://your-orchestrate-instance.com/push"
                    value={formData.push_endpoint}
                    onChange={(e) =>
                      updateField("push_endpoint", e.target.value)
                    }
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-900 dark:text-red-200">
                {error}
              </div>
            )}
          </TabsContent>

          {/* Step 3: Import Status */}
          <TabsContent value="status" className="space-y-4">
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-sidecar-indigo-600 dark:text-sidecar-indigo-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Import in Progress
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Command ID:{" "}
                <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  {commandId}
                </code>
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                The import process is running. You can check the status in the
                Integrations page.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === "method") {
                onClose?.();
              } else if (currentStep === "config") {
                setCurrentStep("method");
              } else {
                onClose?.();
              }
            }}
            className="border-neutral-300 dark:border-neutral-700"
          >
            {currentStep === "status" ? "Close" : "Back"}
          </Button>
          {currentStep !== "status" && (
            <Button
              onClick={() => {
                if (currentStep === "method") {
                  setCurrentStep("config");
                } else {
                  handleImport();
                }
              }}
              disabled={
                !importMethod ||
                loading ||
                (currentStep === "config" &&
                  importMethod === "api" &&
                  (!formData.orchestrate_url ||
                    !formData.auth_token ||
                    (environment === "aws" && !formData.public_api_url)))
              }
              className="bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white font-semibold"
            >
              {loading
                ? "Importing..."
                : currentStep === "config"
                  ? "Import Agent"
                  : "Next"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationSetupWizard;

// Made with Bob
