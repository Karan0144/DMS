import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, PieChart, TrendingUp, Download } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

function ReportingDashboard() {
  const [selectedReport, setSelectedReport] = useState("performance");

  const metrics = {
    performance: [
      { label: "On-Time Deliveries", value: "94%", trend: "up" },
      { label: "Average Wait Time", value: "45 mins", trend: "down" },
      { label: "Container Utilization", value: "87%", trend: "up" },
    ],
    financial: [
      { label: "Revenue per Trip", value: "$450", trend: "up" },
      { label: "Fuel Efficiency", value: "8.5 mpg", trend: "stable" },
      { label: "Operating Costs", value: "$380/day", trend: "down" },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button
          variant={selectedReport === "performance" ? "default" : "outline"}
          onClick={() => setSelectedReport("performance")}
        >
          Performance Metrics
        </Button>
        <Button
          variant={selectedReport === "financial" ? "default" : "outline"}
          onClick={() => setSelectedReport("financial")}
        >
          Financial Reports
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {metrics[selectedReport].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{metric.label}</h3>
                <TrendingUp className={`w-5 h-5 ${
                  metric.trend === "up" ? "text-green-500" : 
                  metric.trend === "down" ? "text-red-500" : 
                  "text-yellow-500"
                }`} />
              </div>
              <p className="text-3xl font-bold">{metric.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Trend Analysis</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-12 h-12 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Distribution</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <PieChart className="w-12 h-12 text-gray-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportingDashboard;