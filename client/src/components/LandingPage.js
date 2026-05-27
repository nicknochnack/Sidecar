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
              Provision A2A Servers
              <br />
              <span className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400">
                On the Fly
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sidecar makes it effortless to spin up Agent-to-Agent servers and
              integrate them seamlessly with watsonx Orchestrate.
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
              Everything you need to manage A2A servers
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Built for developers who need fast, reliable server provisioning
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Instant Provisioning
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Spin up new A2A servers in seconds with our streamlined wizard
                interface.
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Orchestrate Integration
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Seamlessly connect your servers to watsonx Orchestrate with one
                click.
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Real-time Monitoring
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Track server status, logs, and metrics in real-time from your
                dashboard.
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
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join developers who are already using Sidecar to streamline their
              A2A server management.
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
