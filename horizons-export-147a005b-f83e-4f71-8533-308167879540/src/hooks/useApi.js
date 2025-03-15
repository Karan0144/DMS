import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api[endpoint](options);
        setData(result);
      } catch (error) {
        setError(error);
        toast({
          title: "Error",
          description: "Failed to fetch data from API",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(options)]);

  return { data, loading, error };
}