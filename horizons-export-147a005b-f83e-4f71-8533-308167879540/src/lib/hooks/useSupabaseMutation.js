import { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from '@/components/ui/use-toast';

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mutate = async (type, data, options = {}) => {
    try {
      setLoading(true);
      let result;

      switch (type) {
        case 'INSERT':
          result = await supabase.from(table).insert(data);
          break;
        case 'UPDATE':
          result = await supabase
            .from(table)
            .update(data)
            .match({ id: data.id });
          break;
        case 'DELETE':
          result = await supabase
            .from(table)
            .delete()
            .match({ id: data.id });
          break;
        default:
          throw new Error('Invalid mutation type');
      }

      if (result.error) throw result.error;

      toast({
        title: options.successMessage || 'Operation successful',
        description: options.successDescription || 'The data has been updated successfully.',
      });

      return result.data;
    } catch (error) {
      toast({
        title: options.errorMessage || 'Operation failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading };
}