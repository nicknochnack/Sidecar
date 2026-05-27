import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utilities/api";
import { setAuthToken } from "../utilities/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "./Header";
import { GeometricShapes } from "./GeometricShapes";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function Login({ isAuth, setIsAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", { email, password });
      setAuthToken(response.data.token);
      setIsAuth(true);

      // Get the path the user was trying to access, or default to dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      setLoginError("Something went wrong logging you in.");
      setIsLoading(false);
      console.error("Login error:", error.response?.data?.error);
    }
  };
  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {isLoading ? (
        <div className="fixed inset-0 bg-sidecar-indigo-600/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-2xl font-extrabold">Logging in!</div>
        </div>
      ) : (
        <></>
      )}

      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-sidecar-indigo-600 via-sidecar-indigo-700 to-sidecar-indigo-800 pt-24 pb-16 overflow-hidden">
        <GeometricShapes variant="hero" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Log in to access your Sidecar dashboard and manage your A2A servers
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex justify-center items-start px-4 py-12 bg-neutral-50 dark:bg-neutral-900">
        <form onSubmit={handleLogin} className="w-full max-w-md">
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm">
              {loginError}
            </div>
          )}

          <Card className="bg-white dark:bg-neutral-900 shadow-lg border-neutral-200 dark:border-neutral-800">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Login
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-neutral-700 dark:text-neutral-300 font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-neutral-300 dark:border-neutral-700 focus:border-sidecar-indigo-600 focus:ring-sidecar-indigo-600"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className="text-neutral-700 dark:text-neutral-300 font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      tabIndex="-1"
                      to="/forgot-password"
                      className="ml-auto inline-block text-sm text-sidecar-indigo-600 hover:text-sidecar-indigo-700 dark:text-sidecar-indigo-400 dark:hover:text-sidecar-indigo-300 underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="password-input-wrapper">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-neutral-300 dark:border-neutral-700 focus:border-sidecar-indigo-600 focus:ring-sidecar-indigo-600"
                    />

                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-icon"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-sidecar-indigo-600 hover:bg-sidecar-indigo-700 text-white font-bold py-2.5 transition-colors"
                >
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-sidecar-indigo-600 hover:text-sidecar-indigo-700 dark:text-sidecar-indigo-400 dark:hover:text-sidecar-indigo-300 underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default Login;

// Made with Bob
