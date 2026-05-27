import React, { useState, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import ServersDashboard from "./components/servers/ServersDashboard";
import ServerDetail from "./components/servers/ServerDetail";
import ServerCreateWizard from "./components/servers/ServerCreateWizard";
import Integrations from "./components/Integrations";
import { DarkModeProvider } from "./utilities/DarkModeContext";

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
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers"
                element={
                  <PrivateRoute>
                    <ServersDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers/create"
                element={
                  <PrivateRoute>
                    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
                      <ServerCreateWizard />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/servers/:id"
                element={
                  <PrivateRoute>
                    <ServerDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <PrivateRoute>
                    <Integrations />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </authContext.Provider>
    </DarkModeProvider>
  );
}

export default App;

// Made with Bob
