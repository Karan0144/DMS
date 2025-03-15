import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)]"> {/* Subtract header height */}
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Layout;