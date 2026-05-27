import React from "react";

// Geometric decorative shapes for Sidecar design
export const GeometricShapes = ({ variant = "hero" }) => {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left indigo shape */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 transform rotate-45 rounded-3xl" />

        {/* Top left triangle */}
        <svg
          className="absolute top-32 left-8 w-24 h-24 text-white/20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,10 90,90 10,90" />
        </svg>

        {/* Bottom right large shape */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 transform -rotate-12 rounded-full" />

        {/* Bottom right triangle */}
        <svg
          className="absolute bottom-20 right-20 w-32 h-32 text-white/15"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="10,10 90,50 10,90" />
        </svg>

        {/* Small accent triangle */}
        <svg
          className="absolute top-1/2 left-1/4 w-16 h-16 text-white/15"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,20 80,80 20,80" />
        </svg>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {/* Small corner accent */}
        <svg
          className="absolute top-2 right-2 w-8 h-8 text-sidecar-indigo-400"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,10 90,90 10,90" />
        </svg>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Vertical accent shapes */}
        <div className="absolute top-10 right-0 w-2 h-20 bg-sidecar-indigo-400 rounded-l-full" />
        <div className="absolute top-40 right-0 w-2 h-32 bg-sidecar-indigo-400 rounded-l-full opacity-60" />
        <svg
          className="absolute top-80 right-4 w-12 h-12 text-sidecar-indigo-400 opacity-50"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,10 90,90 10,90" />
        </svg>
      </div>
    );
  }

  return null;
};

// Wavy divider between sections
export const WavyDivider = ({ flip = false }) => {
  return (
    <div className={`relative w-full ${flip ? "transform rotate-180" : ""}`}>
      <svg
        className="w-full h-16 md:h-24"
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          fill="currentColor"
          className="text-sidecar-indigo-600"
        />
      </svg>
    </div>
  );
};

export default GeometricShapes;

// Made with Bob
