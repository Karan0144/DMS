import React from "react";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16"> {/* Fixed height */}
      <div className="px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-gray-900"
            >
              Drayage Management
            </motion.h1>
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Search className="w-4 h-4 text-gray-500 ml-2" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="border-none bg-transparent w-48 focus:outline-none h-8"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user?.name || "Guest"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.role || "Not logged in"}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="h-8"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;