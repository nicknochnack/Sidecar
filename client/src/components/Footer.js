import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Made with Bob credit */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Made with{" "}
              <a
                href="https://www.ibm.com/products/watsonx-code-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400 hover:underline font-semibold"
              >
                Bob
              </a>{" "}
              from{" "}
              <a
                href="https://www.ibm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidecar-indigo-600 dark:text-sidecar-indigo-400 hover:underline font-semibold"
              >
                IBM
              </a>
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              Powered by watsonx Code Assistant
            </p>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md border-t border-neutral-300 dark:border-neutral-700"></div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} Sidecar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// Made with Bob
