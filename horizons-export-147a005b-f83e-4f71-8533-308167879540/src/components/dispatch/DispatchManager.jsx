import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, User, Route, Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

function DispatchManager() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const { toast } = useToast();

  const trips = [
    {
      id: "TRIP001",
      driver: "John Doe",
      container: "CONT123",
      status: "In Progress",
      origin: "Port of LA",
      destination: "Chicago Terminal",
      startTime: "08:00",
      estimatedCompletion: "16:00"
    },
    // Add more trips as needed
  ];

  const availableDrivers = [
    { id: 1, name: "John Doe", status: "Available" },
    { id: 2, name: "Jane Smith", status: "On Trip" },
    { id: 3, name: "Mike Johnson", status: "Available" },
  ];

  const handleAssignDriver = (tripId, driverId) => {
    toast({
      title: "Driver Assigned",
      description: "The driver has been successfully assigned to the trip.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Trips</h3>
          <div className="space-y-4">
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Truck className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium">{trip.id}</p>
                      <p className="text-sm text-gray-500">{trip.driver}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trip.status === "In Progress" 
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Drivers</h3>
          <div className="space-y-4">
            {availableDrivers.map((driver) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <User className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.status}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={driver.status !== "Available"}
                >
                  Assign
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {selectedTrip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Route className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p>{selectedTrip.origin} → {selectedTrip.destination}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p>{selectedTrip.startTime} - {selectedTrip.estimatedCompletion}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Button className="w-full">Update Status</Button>
                <Button variant="outline" className="w-full">View Route</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default DispatchManager;