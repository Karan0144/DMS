import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log("Initial session check:", session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            // Create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  name: session.user.email,
                  role: 'manager' // Default role
                }
              ]);

            if (insertError) {
              console.error("Error creating profile:", insertError);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log("Starting login process with email:", credentials.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      console.log("Login successful, user data:", data.user);
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.email}!`,
      });

      return data;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}