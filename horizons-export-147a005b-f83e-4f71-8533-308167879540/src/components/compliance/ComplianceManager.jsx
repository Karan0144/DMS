import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

function ComplianceManager() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { toast } = useToast();

  const documents = [
    {
      id: "DOC001",
      type: "Driver Hours",
      status: "Compliant",
      lastUpdated: "2023-10-01",
      expiryDate: "2023-12-31"
    },
    {
      id: "DOC002",
      type: "Vehicle Inspection",
      status: "Attention Required",
      lastUpdated: "2023-09-15",
      expiryDate: "2023-10-15"
    },
    {
      id: "DOC003",
      type: "Insurance",
      status: "Compliant",
      lastUpdated: "2023-08-01",
      expiryDate: "2024-08-01"
    }
  ];

  const handleUpdateDocument = (docId) => {
    toast({
      title: "Document Updated",
      description: "The compliance document has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Documents</h3>
          <div className="space-y-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">Last updated: {doc.lastUpdated}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    doc.status === "Compliant"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Metrics</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Compliant Documents</span>
                </div>
                <p className="text-2xl font-bold mt-2">24</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Attention Required</span>
                </div>
                <p className="text-2xl font-bold mt-2">3</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Upcoming Renewals</span>
              </div>
              <p className="text-2xl font-bold mt-2">5</p>
            </div>
          </div>
        </Card>
      </div>

      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="font-medium">{selectedDocument.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedDocument.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{selectedDocument.expiryDate}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => handleUpdateDocument(selectedDocument.id)}
                >
                  Update Document
                </Button>
                <Button variant="outline" className="w-full">
                  Download Copy
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default ComplianceManager;