import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import LoadsList from "./components/loads/LoadsList";
import NewLoad from "./components/loads/NewLoad";
import ContainerTracking from "./components/tracking/ContainerTracking";
import AppointmentScheduler from "./components/appointments/AppointmentScheduler";
import DispatchManager from "./components/dispatch/DispatchManager";
import ComplianceManager from "./components/compliance/ComplianceManager";
import ReportingDashboard from "./components/analytics/ReportingDashboard";
import Settings from "./components/settings/Settings";
import Login from "./components/auth/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="loads" element={<LoadsList />} />
                <Route path="loads/new" element={<NewLoad />} />
                <Route path="tracking" element={<ContainerTracking />} />
                <Route path="appointments" element={<AppointmentScheduler />} />
                <Route path="dispatch" element={<DispatchManager />} />
                <Route path="compliance" element={<ComplianceManager />} />
                <Route path="reports" element={<ReportingDashboard />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </AnimatePresence>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;