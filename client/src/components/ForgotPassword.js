import React, { useState } from "react";
import { Link } from "react-router-dom";
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

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>
      <div className="h-screen content-center">
        <div className="flex w-full items-center justify-center px-4">
          <Card className="mx-auto max-w-sm w-[300px]">
            <CardHeader>
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email below, if your account is on file we'll send
                you an email with instructions to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <Label htmlFor="emil">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="grid w-full">
                    <Button type="submit">Reset Password</Button>
                  </div>
                </div>

                <div className="flex items-center justify-center text-sm mt-4">
                  <Link to="/login" className="underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          {message && (
            <p className="mt-2 w-full flex items-center justify-center text-lime-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
