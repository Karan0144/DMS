import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Calendar, Search, MapPin, User, Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";

const LoadsList = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      console.log('Fetching loads...');
      
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched loads:', data);
      setLoads(data || []);
    } catch (error) {
      console.error('Error fetching loads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch loads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLoads = loads.filter(load => {
    if (!searchTerm) return true;
    
    const searchString = searchTerm.toLowerCase();
    return (
      load.container_number?.toLowerCase().includes(searchString) ||
      load.customer?.toLowerCase().includes(searchString) ||
      load.consignee?.toLowerCase().includes(searchString)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">All Loads</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search loads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 h-8"
          />
          <Button 
            variant="outline" 
            onClick={fetchLoads}
            disabled={loading}
            className="h-8"
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredLoads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No loads match your search" : "No loads found in the database"}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredLoads.map((load) => (
              <motion.div
                key={load.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{load.container_number}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          load.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {load.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {load.customer}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {load.port}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(load.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{load.load_type}</p>
                    <p className="text-gray-500">{load.route}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoadsList;