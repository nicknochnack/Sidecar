import React, { useState } from "react";

const HamburgerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="relative h-12 w-12 rounded-lg bg-white p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {/* Top bar */}
      <span
        className={`absolute left-3 h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
          isOpen ? "top-6 rotate-45" : "top-4"
        }`}
      />

      {/* Middle bar */}
      <span
        className={`absolute left-3 top-6 h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Bottom bar */}
      <span
        className={`absolute left-3 h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
          isOpen ? "top-6 -rotate-45" : "top-8"
        }`}
      />
    </button>
  );
};

export default HamburgerButton;
