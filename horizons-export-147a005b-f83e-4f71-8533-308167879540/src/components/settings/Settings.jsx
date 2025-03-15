import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Settings as SettingsIcon, Bell, Lock, User, Globe } from "lucide-react";

function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input placeholder="Your name" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" placeholder="Your email" className="mt-1" />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-500" />
                <span>Email Notifications</span>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span>Browser Notifications</span>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gray-500" />
              <span>Change Password</span>
            </div>
            <Button variant="outline">Update</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <span>Two-Factor Authentication</span>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;