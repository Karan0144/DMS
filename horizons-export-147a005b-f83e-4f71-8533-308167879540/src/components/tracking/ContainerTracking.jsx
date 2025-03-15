import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Package, Navigation, Search, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ContainerTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch containers
  const fetchContainers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('containers')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched containers:', data);
      setContainers(data || []);
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast({
        title: "Error",
        description: "Failed to load containers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchContainers();

    // Set up real-time subscription
    const channel = supabase
      .channel('containers_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'containers'
      }, (payload) => {
        console.log('Container change received:', payload);
        // Update the containers list immediately
        setContainers(currentContainers => {
          switch (payload.eventType) {
            case 'UPDATE':
              return currentContainers.map(container =>
                container.id === payload.new.id ? payload.new : container
              );
            case 'INSERT':
              return [...currentContainers, payload.new];
            case 'DELETE':
              return currentContainers.filter(container => container.id !== payload.old.id);
            default:
              return currentContainers;
          }
        });

        // Update selected container if it was modified
        if (payload.eventType === 'UPDATE' && selectedContainer?.id === payload.new.id) {
          setSelectedContainer(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a container number",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('containers')
        .select('*')
        .ilike('container_number', `%${searchTerm}%`);

      if (error) throw error;

      if (data && data.length > 0) {
        // Update the containers list with search results
        setContainers(data);
        
        // If there's an exact match, select it
        const exactMatch = data.find(
          container => container.container_number.toLowerCase() === searchTerm.toLowerCase()
        );
        if (exactMatch) {
          setSelectedContainer(exactMatch);
        }

        toast({
          title: "Search Results",
          description: `Found ${data.length} container(s)`,
        });
      } else {
        toast({
          title: "No Results",
          description: "No containers match the search criteria",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (containerId, newStatus) => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('containers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', containerId)
        .select()
        .single();

      if (error) throw error;

      // Update both the containers list and selected container immediately
      setContainers(currentContainers =>
        currentContainers.map(container =>
          container.id === containerId ? data : container
        )
      );
      setSelectedContainer(data);

      toast({
        title: "Status Updated",
        description: `Container status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshLocation = async (containerId) => {
    try {
      setRefreshing(true);
      // Simulate updating location with random coordinates near the current location
      const currentLat = selectedContainer.lat || 34.0522;
      const currentLng = selectedContainer.lng || -118.2437;
      
      const newLat = currentLat + (Math.random() - 0.5) * 0.1;
      const newLng = currentLng + (Math.random() - 0.5) * 0.1;

      const { data, error } = await supabase
        .from('containers')
        .update({
          lat: newLat,
          lng: newLng,
          updated_at: new Date().toISOString()
        })
        .eq('id', containerId)
        .select()
        .single();

      if (error) throw error;

      // Update both the containers list and selected container immediately
      setContainers(currentContainers =>
        currentContainers.map(container =>
          container.id === containerId ? data : container
        )
      );
      setSelectedContainer(data);

      toast({
        title: "Location Updated",
        description: "Container location has been refreshed",
      });
    } catch (error) {
      console.error('Failed to refresh location:', error);
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Reset search results
  const handleResetSearch = () => {
    setSearchTerm("");
    fetchContainers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Input 
          placeholder="Enter container number..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch}
          disabled={!searchTerm || loading}
        >
          <Search className="w-4 h-4 mr-2" />
          Track Container
        </Button>
        {searchTerm && (
          <Button 
            variant="outline"
            onClick={handleResetSearch}
            disabled={loading}
          >
            Reset Search
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Containers</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Loading containers...</div>
            ) : containers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No containers found</div>
            ) : (
              containers.map((container) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                    selectedContainer?.id === container.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedContainer(container)}
                >
                  <div className="flex items-center space-x-4">
                    <Package className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium">{container.container_number}</p>
                      <p className="text-sm text-gray-500">{container.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      container.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                      container.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {container.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Container Details</h3>
          {selectedContainer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{selectedContainer.container_number}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefreshLocation(selectedContainer.id)}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Location
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="font-medium">{selectedContainer.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-medium">{selectedContainer.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedContainer.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(selectedContainer.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-64 rounded-lg overflow-hidden border">
                {selectedContainer.lat && selectedContainer.lng ? (
                  <MapContainer
                    center={[selectedContainer.lat, selectedContainer.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[selectedContainer.lat, selectedContainer.lng]}>
                      <Popup>
                        Container {selectedContainer.container_number}
                        <br />
                        Status: {selectedContainer.status}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Location data not available</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedContainer.id, 'in_transit')}
                  disabled={refreshing || selectedContainer.status === 'in_transit'}
                >
                  Mark In Transit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedContainer.id, 'delivered')}
                  disabled={refreshing || selectedContainer.status === 'delivered'}
                >
                  Mark Delivered
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a container to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ContainerTracking;