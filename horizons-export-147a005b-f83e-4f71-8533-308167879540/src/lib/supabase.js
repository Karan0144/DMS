import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuupfhyobcyvrwqjvkzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dXBmaHlvYmN5dnJ3cWp2a3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4OTU0MDYsImV4cCI6MjA1NzQ3MTQwNn0.IrKDbnTvqrg3pbou1-ZJAGEPCPAtKgKWRiZd4zmASMg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Debug function to test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
    
    console.log('Supabase connection successful, test data:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
};