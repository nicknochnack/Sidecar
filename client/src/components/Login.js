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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {isLoading ? (
        <div className="fixed inset-0 bg-tdc-purple/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-2xl font-extrabold">Logging in!</div>
        </div>
      ) : (
        <></>
      )}

      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>

      {/* Hero Section */}
      <div className="relative bg-tdc-purple pt-24 pb-16 overflow-hidden">
        <GeometricShapes variant="hero" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Log in to access your Tour de Cure dashboard and continue making a
            difference
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex justify-center items-start px-4 py-12 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleLogin} className="w-full max-w-md">
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm">
              {loginError}
            </div>
          )}

          <Card className="bg-white shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Login
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-tdc-purple focus:ring-tdc-purple"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      tabIndex="-1"
                      to="/forgot-password"
                      className="ml-auto inline-block text-sm text-tdc-purple hover:text-tdc-purple-dark underline"
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
                      className="border-gray-300 dark:border-gray-600 focus:border-tdc-purple focus:ring-tdc-purple"
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
                  className="w-full bg-tdc-yellow hover:bg-tdc-yellow-dark text-gray-900 dark:text-gray-100 font-bold py-2.5 transition-colors"
                >
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-tdc-purple hover:text-tdc-purple-dark underline font-medium"
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
