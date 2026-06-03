import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authContext } from "../App";
import { logout } from "../utilities/auth";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";
import { useDarkMode } from "../utilities/DarkModeContext";
import sidecarLogo from "./img/other/sidecar.png";

const Header = () => {
  const { isAuth, setIsAuth } = useContext(authContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    navigate("/login");
    setShowMenu(false);
    setShowMobileMenu(false);
  };

  const handleNavClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-neutral-950/80">
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
        {/* Show logo only when NOT authenticated (landing, login, signup pages) */}
        {!isAuth ? (
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={sidecarLogo}
              alt="Sidecar"
              className="w-9 h-9 transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight font-sans">
              Sidecar
            </span>
          </Link>
        ) : (
          <div className="flex-shrink-0"></div>
        )}

        {isAuth && (
          <>
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search agents, tools, knowledge bases..."
                  className="w-full px-4 py-2 pl-10 text-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidecar-indigo-500 dark:focus:ring-sidecar-indigo-400 focus:border-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/models"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 transition-colors"
              >
                Models
              </Link>
              <Link
                to="/environments"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 transition-colors"
              >
                Environments
              </Link>
              <Link
                to="/integrations"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sidecar-indigo-600 dark:hover:text-sidecar-indigo-400 transition-colors"
              >
                Integrations
              </Link>

              {/* Do NOT Press Button */}
              <button className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md transition-colors shadow-sm hover:shadow-md border-2 border-red-700 dark:border-red-800 uppercase">
                Do NOT Press
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5 text-sidecar-indigo-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-neutral-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <div className="relative">
                <Avatar
                  className="w-9 h-9 cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-sidecar-indigo-500 dark:hover:border-sidecar-indigo-500 transition-colors"
                  onClick={() => setShowMenu((v) => !v)}
                >
                  <AvatarFallback className="bg-sidecar-indigo-600 dark:bg-sidecar-indigo-500 text-white text-xs font-semibold font-mono">
                    ME
                  </AvatarFallback>
                </Avatar>

                {showMenu && (
                  <Card className="absolute right-0 top-12 w-40 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-lg p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </Card>
                )}
              </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {/* Dark Mode Toggle for Mobile */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5 text-sidecar-indigo-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-neutral-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setShowMobileMenu((v) => !v)}
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <svg
                    className="w-6 h-6 text-neutral-700 dark:text-neutral-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-neutral-700 dark:text-neutral-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="absolute top-16 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-lg md:hidden">
                <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                  <Link
                    to="/dashboard"
                    onClick={handleNavClick}
                    className="px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/integrations"
                    onClick={handleNavClick}
                    className="px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-colors"
                  >
                    Integrations
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"
                  >
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

// Made with Bob
