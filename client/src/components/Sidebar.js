import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import sidecarLogo from "./img/other/sidecar.png";

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    integrations: false,
    rag: false,
    evaluation: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      path: "/dashboard",
    },
    {
      title: "A2A Servers",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      path: "/servers",
    },
    {
      title: "Third-Party Integrations",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      expandable: true,
      section: "integrations",
      children: [
        { title: "Microsoft Copilot", path: "/integrations/copilot" },
        { title: "Azure Agent Foundry", path: "/integrations/azure" },
        { title: "Gemini Enterprise", path: "/integrations/gemini" },
        { title: "AWS Bedrock", path: "/integrations/bedrock" },
      ],
    },
    {
      title: "Connections",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      path: "/connections",
    },
    {
      title: "Tools & Toolkits",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      path: "/tools",
    },
    {
      title: "RAG",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      expandable: true,
      section: "rag",
      children: [
        { title: "Knowledge Bases", path: "/rag/knowledge-bases" },
        { title: "Central Knowledge Base", path: "/rag/central" },
      ],
    },
    {
      title: "Plugins",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
          />
        </svg>
      ),
      path: "/plugins",
    },
    {
      title: "Traces",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      path: "/traces",
    },
    {
      title: "Evaluation",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      expandable: true,
      section: "evaluation",
      children: [
        { title: "Red Teaming", path: "/evaluation/red-teaming" },
        { title: "Rubric Eval", path: "/evaluation/rubric" },
        { title: "Rapid Eval", path: "/evaluation/rapid" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img
            src={sidecarLogo}
            alt="Sidecar"
            className="w-8 h-8 transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
            Sidecar
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.expandable ? (
              <>
                <button
                  onClick={() => toggleSection(item.section)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isParentActive(item.children.map((c) => c.path))
                      ? "bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedSections[item.section] ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {expandedSections[item.section] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.path)
                            ? "bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400 font-medium"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-sidecar-indigo-50 dark:bg-sidecar-indigo-950 text-sidecar-indigo-600 dark:text-sidecar-indigo-400"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
        <a
          href="https://developer.watson-orchestrate.ibm.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Documentation</span>
        </a>
        <a
          href="https://developer.watson-orchestrate.ibm.com/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
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
          <span>Getting Started</span>
        </a>
        <a
          href="https://community.ibm.com/community/user/watsonai/communities/community-home?CommunityKey=7a3dc5ba-3018-452d-9a43-a49dc6819633"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <span>Forum</span>
        </a>
        <a
          href="https://www.ibm.com/training/watsonx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
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
          <span>Learn</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;

// Made with Bob
