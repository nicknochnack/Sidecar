import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useCreateServer } from "../../hooks/useServers";
import { useNavigate } from "react-router-dom";

const ServerCreateWizard = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { createServer, loading, error } = useCreateServer();
  const [currentStep, setCurrentStep] = useState("basics");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    copilot_secret: "",
    copilot_base_url: "",
    agent_name: "",
    agent_description: "",
    agent_tags: "",
    agent_examples: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const serverData = {
        name: formData.name,
        description: formData.description,
        serverType: "copilot",
        config: {
          directLineSecret: formData.copilot_secret,
          baseUrl: formData.copilot_base_url,
          agentName: formData.agent_name,
          agentDescription: formData.agent_description,
          agentTags: formData.agent_tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          agentExamples: formData.agent_examples
            .split("\n")
            .map((e) => e.trim())
            .filter(Boolean),
        },
      };

      const result = await createServer(serverData);
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/servers/${result.id}`);
      }
    } catch (err) {
      console.error("Failed to create server:", err);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "basics":
        return formData.name && formData.copilot_base_url;
      case "credentials":
        return formData.copilot_secret;
      case "agent":
        return formData.agent_name && formData.agent_description;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          Create New A2A Server
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your Copilot-to-Orchestrate bridge server
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="credentials" disabled={!formData.name}>
              Credentials
            </TabsTrigger>
            <TabsTrigger value="agent" disabled={!formData.copilot_secret}>
              Agent Info
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!formData.agent_name}>
              Review
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Basics */}
          <TabsContent value="basics" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name *</Label>
              <Input
                id="name"
                placeholder="My Copilot Agent"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this server"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copilot_base_url">Copilot Base URL *</Label>
              <Input
                id="copilot_base_url"
                placeholder="https://your-copilot-endpoint.com"
                value={formData.copilot_base_url}
                onChange={(e) =>
                  updateField("copilot_base_url", e.target.value)
                }
                className="bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The base URL for your Microsoft Copilot instance
              </p>
            </div>
          </TabsContent>

          {/* Step 2: Credentials */}
          <TabsContent value="credentials" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copilot_secret">
                Copilot Direct Line Secret *
              </Label>
              <Input
                id="copilot_secret"
                type="password"
                placeholder="Your Direct Line Secret"
                value={formData.copilot_secret}
                onChange={(e) => updateField("copilot_secret", e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This secret will be encrypted and stored securely
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Where to find this:</strong> In your Copilot Studio,
                navigate to Settings → Channels → Direct Line, and copy the
                secret key.
              </p>
            </div>
          </TabsContent>

          {/* Step 3: Agent Info */}
          <TabsContent value="agent" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent_name">Agent Name *</Label>
              <Input
                id="agent_name"
                placeholder="Email Assistant"
                value={formData.agent_name}
                onChange={(e) => updateField("agent_name", e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent_description">Agent Description *</Label>
              <textarea
                id="agent_description"
                placeholder="Helps users manage their email inbox"
                value={formData.agent_description}
                onChange={(e) =>
                  updateField("agent_description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent_tags">Tags (comma-separated)</Label>
              <Input
                id="agent_tags"
                placeholder="email, productivity, automation"
                value={formData.agent_tags}
                onChange={(e) => updateField("agent_tags", e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent_examples">
                Example Prompts (one per line)
              </Label>
              <textarea
                id="agent_examples"
                placeholder="Check my unread emails&#10;Send an email to John&#10;Archive old messages"
                value={formData.agent_examples}
                onChange={(e) => updateField("agent_examples", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </TabsContent>

          {/* Step 4: Review */}
          <TabsContent value="review" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Review Configuration
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Server Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Copilot URL:
                  </span>
                  <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                    {formData.copilot_base_url}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Agent Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formData.agent_name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tags:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formData.agent_tags || "None"}
                  </span>
                </div>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-900 dark:text-red-200">
                {error}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === "basics") {
                onClose?.();
              } else {
                const steps = ["basics", "credentials", "agent", "review"];
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
          >
            {currentStep === "basics" ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => {
              if (currentStep === "review") {
                handleSubmit();
              } else {
                const steps = ["basics", "credentials", "agent", "review"];
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex + 1]);
              }
            }}
            disabled={!canProceed() || loading}
          >
            {loading
              ? "Creating..."
              : currentStep === "review"
                ? "Create Server"
                : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerCreateWizard;

// Made with Bob
