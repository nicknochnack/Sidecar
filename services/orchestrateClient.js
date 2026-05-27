const axios = require("axios");
const config = require("config");

const workerUrl = config.get("worker.url");

async function importAgent(yamlContent) {
  try {
    const { data } = await axios.post(
      `${workerUrl}/agents/import`,
      new URLSearchParams({ yaml_content: yamlContent }),
      { timeout: 30000 },
    );
    return data; // { status, output, error }
  } catch (err) {
    return { status: "error", output: "", error: err.message };
  }
}

async function importAgentViaAPI(orchestrateConfig) {
  try {
    const {
      orchestrate_url,
      auth_token,
      name,
      display_name,
      description,
      instructions,
      api_url,
      auth_scheme = "NONE",
      chat_params = {
        sendHistory: true,
        stream: false,
        pushNotifications: true,
      },
      environment = "local", // 'local' or 'aws'
    } = orchestrateConfig;

    const payload = {
      name,
      title: display_name || name,
      description: description || `A2A Agent: ${name}`,
      instructions: instructions || "This is an A2A agent.",
      provider: "external_chat/A2A/0.3.0",
      kind: "external",
      api_url,
      auth_scheme,
      chat_params,
    };

    // Determine the correct endpoint based on environment
    let endpoint;
    if (environment === "aws") {
      // AWS format: https://api.{region}.dl.watson-orchestrate.ibm.com/instances/{instance-id}/v1/orchestrate/agents/external-chat
      endpoint = `${orchestrate_url}/v1/orchestrate/agents/external-chat`;
    } else {
      // Local format: {base_url}/v1/agents/external-chat
      endpoint = `${orchestrate_url}/v1/agents/external-chat`;
    }

    console.log(
      `Importing agent to ${environment} environment at: ${endpoint}`,
    );

    const { data } = await axios.post(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth_token}`,
      },
      timeout: 30000,
    });

    return {
      status: "success",
      output: `Agent imported successfully to ${environment} environment. Agent ID: ${data.id || "N/A"}`,
      data,
    };
  } catch (err) {
    const errorDetails = err.response?.data
      ? JSON.stringify(err.response.data, null, 2)
      : err.message;
    return {
      status: "error",
      output: "",
      error: `Failed to import agent: ${errorDetails}`,
    };
  }
}

async function configureModel(provider, yamlContent) {
  try {
    const { data } = await axios.post(
      `${workerUrl}/models/configure`,
      new URLSearchParams({ provider, yaml_content: yamlContent }),
      { timeout: 30000 },
    );
    return data;
  } catch (err) {
    return { status: "error", output: "", error: err.message };
  }
}

module.exports = { importAgent, importAgentViaAPI, configureModel };

// Made with Bob
