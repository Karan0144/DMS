import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Building } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";

function AppointmentScheduler() {
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [terminals] = useState([
    { id: '1', name: "Terminal A", location: "Port of LA" },
    { id: '2', name: "Terminal B", location: "Long Beach Port" },
    { id: '3', name: "Terminal C", location: "Oakland Port" },
  ]);
  const { toast } = useToast();

  // Fetch appointments for selected terminal
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedTerminal) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select('*, containers(container_number), profiles(name)')
          .eq('terminal_id', selectedTerminal.id)
          .order('time_slot', { ascending: true });

        if (error) {
          throw error;
        }
        
        console.log('Fetched appointments:', data);
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (selectedTerminal) {
      fetchAppointments();
    }

    // Set up real-time subscription for the selected terminal
    let channel;
    if (selectedTerminal) {
      channel = supabase
        .channel(`appointments_${selectedTerminal.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `terminal_id=eq.${selectedTerminal.id}`
        }, (payload) => {
          console.log('Appointment change received:', payload);
          fetchAppointments();
        })
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedTerminal]);

  const handleBookAppointment = async (formData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          terminal_id: selectedTerminal.id,
          time_slot: selectedSlot.time,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });

      setSelectedSlot(null);
      setAppointments([...appointments, data]);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots for the current day
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 17;
    const currentDate = new Date();
    currentDate.setMinutes(0, 0, 0); // Reset minutes, seconds, and milliseconds

    for (let hour = startHour; hour <= endHour; hour++) {
      const slotTime = new Date(currentDate);
      slotTime.setHours(hour);
      
      slots.push({
        id: hour,
        time: slotTime.toISOString(),
        displayTime: `${hour.toString().padStart(2, '0')}:00`
      });
    }

    return slots;
  };

  const isSlotBooked = (slot) => {
    return appointments.some(app => {
      const appTime = new Date(app.time_slot);
      const slotTime = new Date(slot.time);
      return appTime.getHours() === slotTime.getHours();
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Terminal</h3>
          <div className="space-y-4">
            {terminals.map((terminal) => (
              <motion.div
                key={terminal.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  selectedTerminal?.id === terminal.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTerminal(terminal)}
              >
                <div className="flex items-center space-x-4">
                  <Building className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium">{terminal.name}</p>
                    <p className="text-sm text-gray-500">{terminal.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
          <div className="space-y-4">
            {!selectedTerminal ? (
              <div className="text-center py-4 text-gray-500">
                Please select a terminal first
              </div>
            ) : loading ? (
              <div className="text-center py-4">Loading time slots...</div>
            ) : (
              timeSlots.map((slot) => {
                const isBooked = isSlotBooked(slot);

                return (
                  <motion.button
                    key={slot.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`w-full p-4 border rounded-lg flex items-center justify-between ${
                      isBooked 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'hover:bg-blue-50 cursor-pointer'
                    }`}
                    onClick={() => !isBooked && setSelectedSlot(slot)}
                    disabled={isBooked}
                  >
                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{slot.displayTime}</span>
                    </div>
                    <span className={`text-sm ${
                      isBooked ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isBooked ? 'Booked' : 'Available'}
                    </span>
                  </motion.button>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {selectedSlot && selectedTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Appointment</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Container Number" 
                  disabled={loading}
                />
                <Input 
                  placeholder="Driver Name" 
                  disabled={loading}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleBookAppointment}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default AppointmentScheduler;