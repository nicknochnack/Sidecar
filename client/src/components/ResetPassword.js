import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utilities/api";

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
import Header from "./Header";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        email,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="flex h-screen max-w] items-center justify-center px-4">
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>
      <Card className="mx-auto max-w-sm w-[300px]">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below to reset your details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="confirmpassword">Confirm Password</Label>
                <Input
                  id="confirmpassword"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Set New Password</Button>
              <p className="flex mx-auto text-sm underline">
                <Link to="/login">Back to Login</Link>
              </p>
            </div>
          </form>

          <div>
            {message && (
              <p className="flex items-center justify-center text-lime-100">
                {message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;
