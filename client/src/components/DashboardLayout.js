import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;

// Made with Bob
