import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function Signup({ setIsAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/register", { email, password });
      if (response && response.data && response.data.token) {
        setAuthToken(response.data.token);
        setIsAuth(true);
        navigate("/dashboard");
      } else {
        setError("Unexpected response from server");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.error || "An error occurred during signup",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>

      {/* Hero Section */}
      <div className="relative bg-tdc-purple pt-24 pb-16 overflow-hidden">
        <GeometricShapes variant="hero" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Join the Movement
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Create your account and start making a difference in the fight
            against cancer
          </p>
        </div>
      </div>

      {/* Signup Form Section */}
      <div className="flex justify-center items-start px-4 py-12 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSignup} className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm">
              {error}
            </div>
          )}

          <Card className="bg-white shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sign Up
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Create a new account below with your email
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
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Password
                  </Label>
                  <div className="password-input-wrapper">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
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
                  Sign Up
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-tdc-purple hover:text-tdc-purple-dark underline font-medium"
                >
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default Signup;

// Made with Bob
