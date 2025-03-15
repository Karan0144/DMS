import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Truck, Calendar, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";

function Dashboard() {
  const { toast } = useToast();
  const [recentContainers, setRecentContainers] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const metrics = [
    { title: "Active Shipments", value: "24", icon: Truck, color: "bg-blue-500" },
    { title: "Pending Appointments", value: "12", icon: Calendar, color: "bg-yellow-500" },
    { title: "Available Drivers", value: "8", icon: MapPin, color: "bg-green-500" },
    { title: "Average Wait Time", value: "45m", icon: Clock, color: "bg-purple-500" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch containers
      const { data: containers, error: containersError } = await supabase
        .from('containers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (containersError) {
        throw containersError;
      }

      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .gte('time_slot', new Date().toISOString())
        .order('time_slot', { ascending: true })
        .limit(3);

      if (appointmentsError) {
        throw appointmentsError;
      }

      setRecentContainers(containers || []);
      setUpcomingAppointments(appointments || []);
      
      console.log('Fetched containers:', containers);
      console.log('Fetched appointments:', appointments);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const containersSubscription = supabase
      .channel('containers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'containers'
      }, () => {
        fetchData();
      })
      .subscribe();

    const appointmentsSubscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(containersSubscription);
      supabase.removeChannel(appointmentsSubscription);
    };
  }, []);

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading dashboard data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`${metric.color} p-3 rounded-full`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{metric.title}</p>
                <h3 className="text-2xl font-bold">{metric.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : recentContainers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent activity</div>
            ) : (
              recentContainers.map((container, index) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{container.container_number}</p>
                    <p className="text-sm text-gray-500">{container.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      container.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                      container.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {container.status}
                    </span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No upcoming appointments</div>
            ) : (
              upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Terminal {appointment.terminal_id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.time_slot).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;