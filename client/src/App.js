import React, { useState, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import ServersDashboard from "./components/servers/ServersDashboard";
import ServerDetail from "./components/servers/ServerDetail";
import ServerCreateWizard from "./components/servers/ServerCreateWizard";
import Integrations from "./components/Integrations";
import Sidebar from "./components/Sidebar";
import DashboardLayout from "./components/DashboardLayout";
import { DarkModeProvider } from "./utilities/DarkModeContext";

// Import all capability pages
import {
  IntegrationsCopilot,
  IntegrationsAzure,
  IntegrationsGemini,
  IntegrationsBedrock,
  Connections,
  ToolsAndToolkits,
  RAGKnowledgeBases,
  RAGCentral,
  Plugins,
  Traces,
  EvaluationRedTeaming,
  EvaluationRubric,
  EvaluationRapid,
} from "./components/capabilities/CapabilityPages";

import "./App.css";

export const authContext = createContext();

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <DarkModeProvider>
      <authContext.Provider
        value={{ isAuth, setIsAuth, isLoading, setIsLoading }}
      >
        <Router>
          <div className="antialiased text-foreground bg-white dark:bg-neutral-950 dark:text-neutral-100 min-h-screen">
            <Routes>
              <Route
                path="/login"
                element={<Login isAuth={isAuth} setIsAuth={setIsAuth} />}
              />
              <Route
                path="/signup"
                element={<Signup setIsAuth={setIsAuth} />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              {/* Dashboard Routes with Sidebar */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ServersDashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers/create"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ServerCreateWizard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers/:id"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ServerDetail />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Third-Party Integration Routes */}
              <Route
                path="/integrations/copilot"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <IntegrationsCopilot />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/integrations/azure"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <IntegrationsAzure />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/integrations/gemini"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <IntegrationsGemini />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/integrations/bedrock"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <IntegrationsBedrock />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Connections Route */}
              <Route
                path="/connections"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Connections />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Tools & Toolkits Route */}
              <Route
                path="/tools"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ToolsAndToolkits />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* RAG Routes */}
              <Route
                path="/rag/knowledge-bases"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <RAGKnowledgeBases />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/rag/central"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <RAGCentral />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Plugins Route */}
              <Route
                path="/plugins"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Plugins />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Traces Route */}
              <Route
                path="/traces"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Traces />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Evaluation Routes */}
              <Route
                path="/evaluation/red-teaming"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <EvaluationRedTeaming />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/evaluation/rubric"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <EvaluationRubric />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/evaluation/rapid"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <EvaluationRapid />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Legacy Integrations Route (keeping for compatibility) */}
              <Route
                path="/integrations"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Integrations />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </authContext.Provider>
    </DarkModeProvider>
  );
}

export default App;

// Made with Bob
