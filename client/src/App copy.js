import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import HeroLanding from "./components/HeroLanding";
import Dashboard from "./components/Dashboard";
import CourseContent from "./components/CourseContent";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import CheckEmail from "./components/CheckEmail";
import { checkAuthStatus, logout, setAuthToken } from "./utilities/auth";
import Onboard from "./components/Onboard";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Contact from "./components/Contact";

import "./App.css";

export const authContext = createContext();

function AppContent() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          setAuthToken(token); // Set the token in axios headers
          const authStatus = await checkAuthStatus();
          setIsAuth(authStatus);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <authContext.Provider value={{ isAuth, setIsAuth, isLoading }}>
      <div className="antialiased text-slate-500 dark:text-slate-400 bg-slate-900 vsc-initialized">
        <Routes>
          <Route path="/" element={<HeroLanding />} />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/signup" element={<Signup setIsAuth={setIsAuth} />} />
          <Route
            path="/login"
            element={<Login isAuth={isAuth} setIsAuth={setIsAuth} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/email-success" element={<CheckEmail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuth={isAuth}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute isAuth={isAuth}>
                <CourseContent />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </authContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
