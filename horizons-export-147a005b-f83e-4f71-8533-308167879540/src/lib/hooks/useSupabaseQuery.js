import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { query = {}, realtime = false } = options;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let queryBuilder = supabase.from(table).select(query.select || '*');

        // Apply filters
        if (query.filters) {
          query.filters.forEach(filter => {
            queryBuilder = queryBuilder.filter(filter.column, filter.operator, filter.value);
          });
        }

        // Apply ordering
        if (query.orderBy) {
          queryBuilder = queryBuilder.order(query.orderBy.column, {
            ascending: query.orderBy.ascending
          });
        }

        const { data: result, error: queryError } = await queryBuilder;

        if (queryError) throw queryError;
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Query error:', err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription if enabled
    let subscription;
    if (realtime) {
      const channel = supabase.channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: table 
        }, (payload) => {
          setData(currentData => {
            if (!currentData) return [payload.new];

            switch (payload.eventType) {
              case 'INSERT':
                return [...currentData, payload.new];
              case 'UPDATE':
                return currentData.map(item => 
                  item.id === payload.new.id ? payload.new : item
                );
              case 'DELETE':
                return currentData.filter(item => item.id !== payload.old.id);
              default:
                return currentData;
            }
          });
        });

      // Subscribe to the channel
      subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to changes in ${table}`);
        }
      });
    }

    // Cleanup function
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [table, JSON.stringify(query), realtime]);

  return { data, error, loading };
}