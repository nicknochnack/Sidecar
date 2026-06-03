import React from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../utilities/DarkModeContext";
import sidecarLogo from "./img/other/sidecar.png";
import { Button } from "./ui/button";

function LandingPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={sidecarLogo}
              alt="Sidecar"
              className="w-9 h-9 transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Sidecar
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
              Your Watson Orchestrate
              <br />
              <span className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400">
                Development Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sidecar simplifies Watson Orchestrate ADK development with tools
              for A2A server provisioning, agent integrations, RAG management,
              evaluation, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Building
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Complete Watson Orchestrate ADK Toolkit
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Everything you need to build, test, and deploy AI agents with
              Watson Orchestrate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-sidecar-indigo-600 dark:hover:border-sidecar-indigo-400 transition-colors">
              <div className="w-12 h-12 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                A2A Server Provisioning
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Spin up Agent-to-Agent bridge servers instantly and connect to
                Copilot, Gemini, AWS Bedrock, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-sidecar-indigo-600 dark:hover:border-sidecar-indigo-400 transition-colors">
              <div className="w-12 h-12 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                RAG & Knowledge Bases
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage knowledge bases and configure RAG pipelines for your AI
                agents with ease.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-sidecar-indigo-600 dark:hover:border-sidecar-indigo-400 transition-colors">
              <div className="w-12 h-12 bg-sidecar-indigo-100 dark:bg-sidecar-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Testing & Evaluation
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Red teaming, rubric evaluation, and rapid testing tools to
                ensure agent quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-sidecar-indigo-600 to-sidecar-indigo-800 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to supercharge your Watson Orchestrate development?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join developers using Sidecar to build, test, and deploy AI agents
              faster with Watson Orchestrate ADK.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-sidecar-indigo-600 hover:bg-neutral-100 text-lg px-8 py-6"
              >
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={sidecarLogo} alt="Sidecar" className="w-8 h-8" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                © 2026 Sidecar. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                to="/login"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

// Made with Bob
