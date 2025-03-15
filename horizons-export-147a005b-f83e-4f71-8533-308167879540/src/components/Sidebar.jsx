import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Truck, Calendar, Map, FileText, BarChart, Settings, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Package, label: "Loads", path: "/loads" },
    { icon: Plus, label: "New Load", path: "/loads/new" },
    { icon: Truck, label: "Container Tracking", path: "/tracking" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: Map, label: "Dispatch", path: "/dispatch" },
    { icon: FileText, label: "Compliance", path: "/compliance" },
    { icon: BarChart, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-52 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
    >
      <nav className="p-2 space-y-1">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center w-full px-2 py-1.5 rounded-lg transition-colors text-sm",
              location.pathname === item.path
                ? "bg-blue-50 text-blue-600" 
                : "hover:bg-gray-50 text-gray-600"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="w-4 h-4 mr-2" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  );
}

export default Sidebar;