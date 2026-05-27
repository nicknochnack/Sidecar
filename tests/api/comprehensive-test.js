const axios = require("axios");

const baseUrl = process.env.API_URL || "http://localhost:5050";
let authToken = null;
let testUserId = null;
let testServerId = null;
let testCommandId = null;

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(endpoint, method) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log(`Testing: ${method} ${endpoint}`, colors.blue);
  log("=".repeat(60), colors.cyan);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message, error) {
  log(`✗ ${message}`, colors.red);
  if (error.response) {
    log(`  Status: ${error.response.status}`, colors.red);
    log(`  Data: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
  } else {
    log(`  Error: ${error.message}`, colors.red);
  }
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function recordTest(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
    logSuccess(name);
  } else {
    results.failed++;
    logError(name, error);
  }
}

// Helper function to make authenticated requests
async function authenticatedRequest(method, url, data = null) {
  const config = {
    method,
    url: `${baseUrl}${url}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };
  if (data) {
    config.data = data;
  }
  return axios(config);
}

// Test 1: Health Check
async function testHealthCheck() {
  logTest("/health", "GET");
  try {
    const res = await axios.get(`${baseUrl}/health`);
    if (res.data.status === "ok" && res.data.service === "sidecar-api") {
      recordTest("Health check returns correct response", true);
    } else {
      recordTest(
        "Health check returns correct response",
        false,
        new Error("Unexpected response format"),
      );
    }
  } catch (error) {
    recordTest("Health check endpoint", false, error);
  }
}

// Test 2: Register User
async function testRegister() {
  logTest("/auth/register", "POST");
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;

  try {
    const res = await axios.post(`${baseUrl}/auth/register`, {
      email: testEmail,
      password: "TestPassword123!",
      name: "Test User",
    });

    if (res.data.token) {
      authToken = res.data.token;
      testUserId = res.data.user?.id;
      recordTest("User registration successful", true);
      logSuccess(`Auth token obtained: ${authToken.substring(0, 20)}...`);
    } else {
      recordTest(
        "User registration returns token",
        false,
        new Error("No token in response"),
      );
    }
  } catch (error) {
    recordTest("User registration", false, error);
  }
}

// Test 3: Login
async function testLogin() {
  logTest("/auth/login", "POST");

  // First, create a user to login with
  const timestamp = Date.now();
  const loginEmail = `login${timestamp}@example.com`;
  const loginPassword = "LoginPassword123!";

  try {
    // Register first
    await axios.post(`${baseUrl}/auth/register`, {
      email: loginEmail,
      password: loginPassword,
      name: "Login Test User",
    });

    // Now try to login
    const res = await axios.post(`${baseUrl}/auth/login`, {
      email: loginEmail,
      password: loginPassword,
    });

    if (res.data.token) {
      recordTest("User login successful", true);
    } else {
      recordTest(
        "User login returns token",
        false,
        new Error("No token in response"),
      );
    }
  } catch (error) {
    recordTest("User login", false, error);
  }
}

// Test 4: Get Current User (Me)
async function testGetMe() {
  logTest("/auth/me", "GET");

  if (!authToken) {
    logWarning("Skipping /auth/me test - no auth token available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest("GET", "/auth/me");

    if (res.data.user && res.data.user.id && res.data.user.email) {
      recordTest("Get current user info", true);
    } else {
      recordTest(
        "Get current user returns valid data",
        false,
        new Error("Missing user data"),
      );
    }
  } catch (error) {
    recordTest("Get current user", false, error);
  }
}

// Test 5: Forgot Password
async function testForgotPassword() {
  logTest("/auth/forgot-password", "POST");

  try {
    const res = await axios.post(`${baseUrl}/auth/forgot-password`, {
      email: "test@example.com",
    });

    // This should succeed even if email doesn't exist (security best practice)
    recordTest("Forgot password request", true);
  } catch (error) {
    recordTest("Forgot password", false, error);
  }
}

// Test 6: Reset Password
async function testResetPassword() {
  logTest("/auth/reset-password", "POST");

  try {
    const res = await axios.post(`${baseUrl}/auth/reset-password`, {
      token: "dummy-token",
      email: "test@example.com",
      password: "NewPassword123!",
    });

    // This will likely fail with invalid token, which is expected
    recordTest("Reset password endpoint accessible", true);
  } catch (error) {
    // Expected to fail with 400 or 401 for invalid token
    if (
      error.response &&
      (error.response.status === 400 || error.response.status === 401)
    ) {
      recordTest("Reset password validates token", true);
    } else {
      recordTest("Reset password", false, error);
    }
  }
}

// Test 7: Create Server
async function testCreateServer() {
  logTest("/servers", "POST");

  if (!authToken) {
    logWarning("Skipping server creation test - no auth token available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest("POST", "/servers", {
      name: `Test Server ${Date.now()}`,
      description: "Automated test server",
      serverType: "copilot",
      config: {
        directLineSecret: "test-secret-123",
        baseUrl: "https://directline.botframework.com/v3/directline",
      },
    });

    if (res.data.id) {
      testServerId = res.data.id;
      recordTest("Create server", true);
      logSuccess(`Server created with ID: ${testServerId}`);
    } else {
      recordTest(
        "Create server returns ID",
        false,
        new Error("No server ID in response"),
      );
    }
  } catch (error) {
    recordTest("Create server", false, error);
  }
}

// Test 8: List Servers
async function testListServers() {
  logTest("/servers", "GET");

  if (!authToken) {
    logWarning("Skipping list servers test - no auth token available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest("GET", "/servers");

    if (Array.isArray(res.data)) {
      recordTest("List servers returns array", true);
      logSuccess(`Found ${res.data.length} server(s)`);
    } else {
      recordTest(
        "List servers returns array",
        false,
        new Error("Response is not an array"),
      );
    }
  } catch (error) {
    recordTest("List servers", false, error);
  }
}

// Test 9: Get Server Detail
async function testGetServerDetail() {
  logTest("/servers/:id", "GET");

  if (!authToken) {
    logWarning("Skipping server detail test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping server detail test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest("GET", `/servers/${testServerId}`);

    if (res.data.id === testServerId) {
      recordTest("Get server detail", true);
    } else {
      recordTest(
        "Get server detail returns correct server",
        false,
        new Error("Server ID mismatch"),
      );
    }
  } catch (error) {
    recordTest("Get server detail", false, error);
  }
}

// Test 10: Start Server
async function testStartServer() {
  logTest("/servers/:id/start", "POST");

  if (!authToken) {
    logWarning("Skipping start server test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping start server test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "POST",
      `/servers/${testServerId}/start`,
    );
    recordTest("Start server", true);
  } catch (error) {
    recordTest("Start server", false, error);
  }
}

// Test 11: Get Server Status
async function testGetServerStatus() {
  logTest("/servers/:id/status", "GET");

  if (!authToken) {
    logWarning("Skipping server status test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping server status test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "GET",
      `/servers/${testServerId}/status`,
    );

    if (res.data.status) {
      recordTest("Get server status", true);
      logSuccess(`Server status: ${res.data.status}`);
    } else {
      recordTest(
        "Get server status returns status",
        false,
        new Error("No status in response"),
      );
    }
  } catch (error) {
    recordTest("Get server status", false, error);
  }
}

// Test 12: Stop Server
async function testStopServer() {
  logTest("/servers/:id/stop", "POST");

  if (!authToken) {
    logWarning("Skipping stop server test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping stop server test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "POST",
      `/servers/${testServerId}/stop`,
    );
    recordTest("Stop server", true);
  } catch (error) {
    recordTest("Stop server", false, error);
  }
}

// Test 13: Get Server Tasks
async function testGetServerTasks() {
  logTest("/metrics/servers/:id/tasks", "GET");

  if (!authToken) {
    logWarning("Skipping server tasks test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping server tasks test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "GET",
      `/metrics/servers/${testServerId}/tasks`,
    );

    if (Array.isArray(res.data)) {
      recordTest("Get server tasks", true);
      logSuccess(`Found ${res.data.length} task(s)`);
    } else {
      recordTest(
        "Get server tasks returns array",
        false,
        new Error("Response is not an array"),
      );
    }
  } catch (error) {
    recordTest("Get server tasks", false, error);
  }
}

// Test 14: Get Server Metrics
async function testGetServerMetrics() {
  logTest("/metrics/servers/:id/metrics", "GET");

  if (!authToken) {
    logWarning("Skipping server metrics test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping server metrics test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "GET",
      `/metrics/servers/${testServerId}/metrics`,
    );

    if (Array.isArray(res.data)) {
      recordTest("Get server metrics", true);
      logSuccess(`Found ${res.data.length} metric(s)`);
    } else {
      recordTest(
        "Get server metrics returns array",
        false,
        new Error("Response is not an array"),
      );
    }
  } catch (error) {
    recordTest("Get server metrics", false, error);
  }
}

// Test 15: Get Server Metrics Summary
async function testGetServerMetricsSummary() {
  logTest("/metrics/servers/:id/metrics/summary", "GET");

  if (!authToken) {
    logWarning("Skipping metrics summary test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testServerId) {
    logWarning("Skipping metrics summary test - no test server ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "GET",
      `/metrics/servers/${testServerId}/metrics/summary`,
    );
    recordTest("Get server metrics summary", true);
  } catch (error) {
    recordTest("Get server metrics summary", false, error);
  }
}

// Test 16: Import Agent
async function testImportAgent() {
  logTest("/orchestrate/agents/import", "POST");

  if (!authToken) {
    logWarning("Skipping import agent test - no auth token available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "POST",
      "/orchestrate/agents/import",
      {
        agentUrl: "https://example.com/agent",
        name: "Test Agent",
      },
    );

    if (res.data.commandId) {
      testCommandId = res.data.commandId;
      recordTest("Import agent", true);
      logSuccess(`Command created with ID: ${testCommandId}`);
    } else {
      recordTest(
        "Import agent returns command ID",
        false,
        new Error("No command ID in response"),
      );
    }
  } catch (error) {
    recordTest("Import agent", false, error);
  }
}

// Test 17: Get Command Status
async function testGetCommand() {
  logTest("/orchestrate/commands/:id", "GET");

  if (!authToken) {
    logWarning("Skipping get command test - no auth token available");
    results.warnings++;
    return;
  }

  if (!testCommandId) {
    logWarning("Skipping get command test - no command ID available");
    results.warnings++;
    return;
  }

  try {
    const res = await authenticatedRequest(
      "GET",
      `/orchestrate/commands/${testCommandId}`,
    );

    if (res.data.id === testCommandId) {
      recordTest("Get command status", true);
    } else {
      recordTest(
        "Get command returns correct command",
        false,
        new Error("Command ID mismatch"),
      );
    }
  } catch (error) {
    recordTest("Get command status", false, error);
  }
}

// Print final summary
function printSummary() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("TEST SUMMARY", colors.cyan);
  log("=".repeat(60), colors.cyan);

  log(`\nTotal Tests: ${results.passed + results.failed}`, colors.blue);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, colors.red);
  log(`Warnings: ${results.warnings}`, colors.yellow);

  const successRate = (
    (results.passed / (results.passed + results.failed)) *
    100
  ).toFixed(2);
  log(
    `\nSuccess Rate: ${successRate}%`,
    successRate >= 80 ? colors.green : colors.red,
  );

  if (results.failed > 0) {
    log("\nFailed Tests:", colors.red);
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => {
        log(`  - ${t.name}`, colors.red);
      });
  }

  log("\n" + "=".repeat(60), colors.cyan);
}

// Main test runner
async function runAllTests() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("SIDECAR API COMPREHENSIVE TEST SUITE", colors.cyan);
  log("=".repeat(60), colors.cyan);
  log(`Base URL: ${baseUrl}`, colors.blue);
  log(`Started at: ${new Date().toISOString()}`, colors.blue);

  try {
    // Health and Auth tests
    await testHealthCheck();
    await testRegister();
    await testLogin();
    await testGetMe();
    await testForgotPassword();
    await testResetPassword();

    // Server management tests
    await testCreateServer();
    await testListServers();
    await testGetServerDetail();
    await testStartServer();
    await testGetServerStatus();
    await testStopServer();

    // Metrics tests
    await testGetServerTasks();
    await testGetServerMetrics();
    await testGetServerMetricsSummary();

    // Orchestrate tests
    await testImportAgent();
    await testGetCommand();
  } catch (error) {
    log("\nUnexpected error during test execution:", colors.red);
    console.error(error);
  }

  printSummary();

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();

// Made with Bob
