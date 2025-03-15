import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { testConnection } from "@/lib/supabase";

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Test connection on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      console.log('Supabase connection test result:', isConnected);
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Form submission started");
      
      // Basic validation
      if (!credentials.email.trim() || !credentials.password.trim()) {
        throw new Error("Please fill in all fields");
      }

      console.log("Attempting login with email:", credentials.email);
      const response = await login(credentials);
      console.log("Login response received:", response);

      if (response?.user) {
        console.log("Login successful, navigating to dashboard");
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Login form error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the dashboard
          </p>
        </div>
        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-gray-600">
            Test credentials for demo:
            <br />
            Email: admin@example.com
            <br />
            Password: Admin123!@#
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;