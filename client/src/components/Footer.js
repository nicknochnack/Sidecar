import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Made with Bob credit */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Made with{" "}
              <a
                href="https://www.ibm.com/products/watsonx-code-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tdc-purple dark:text-tdc-yellow hover:underline font-semibold"
              >
                Bob
              </a>{" "}
              from{" "}
              <a
                href="https://www.ibm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tdc-purple dark:text-tdc-yellow hover:underline font-semibold"
              >
                IBM
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Powered by watsonx Code Assistant
            </p>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md border-t border-gray-300 dark:border-gray-600"></div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Tour De Data. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// Made with Bob
