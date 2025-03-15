import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";
import { extractDataFromImage } from "@/lib/imageProcessing";

const NewLoad = () => {
  const [entryMethod, setEntryMethod] = useState("manual");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    load_type: "",
    customer: "",
    port: "",
    consignee: "",
    container_number: "",
    route: "",
    status: "pending"
  });
  const [previewData, setPreviewData] = useState(null);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('loads')
        .insert([
          {
            ...formData,
            entry_method: entryMethod,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Load created successfully!",
      });

      // Reset form
      setFormData({
        load_type: "",
        customer: "",
        port: "",
        consignee: "",
        container_number: "",
        route: "",
        status: "pending"
      });
      setStep(1);
      setPreviewData(null);

    } catch (error) {
      console.error('Error creating load:', error);
      toast({
        title: "Error",
        description: "Failed to create load. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (PNG, JPG, JPEG)",
        variant: "destructive",
      });
      return;
    }

    await processFile(file);
  };

  const processFile = async (file) => {
    setLoading(true);
    try {
      const extractedData = await extractDataFromImage(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewData({ ...extractedData, imagePreview: reader.result });
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewData(extractedData);
      }

      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        load_type: extractedData.loadType !== 'Not detected' ? extractedData.loadType : '',
        customer: extractedData.customer !== 'Not detected' ? extractedData.customer : '',
        container_number: extractedData.containerNumber !== 'Not detected' ? extractedData.containerNumber : '',
        port: extractedData.port !== 'Not detected' ? extractedData.port : ''
      }));

      setStep(2);
      
      toast({
        title: "File Processed",
        description: "Please verify the extracted information.",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing Error",
        description: "Could not process the file. Please try again or enter data manually.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const preventDefault = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Load</h2>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base">Select Entry Method</Label>
            <RadioGroup
              defaultValue="manual"
              className="grid grid-cols-2 gap-4 mt-2"
              onValueChange={setEntryMethod}
            >
              <div>
                <RadioGroupItem
                  value="manual"
                  id="manual"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="manual"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileText className="mb-2 h-6 w-6" />
                  Manually
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="automatic"
                  id="automatic"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="automatic"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Upload className="mb-2 h-6 w-6" />
                  Automatically
                </Label>
              </div>
            </RadioGroup>
          </div>

          {entryMethod === "manual" ? (
            <div className="space-y-4">
              <div>
                <Label>Load Type</Label>
                <Select
                  value={formData.load_type}
                  onValueChange={(value) => handleInputChange('load_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select load type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="bill_only">Bill Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Customer</Label>
                <Input 
                  placeholder="Enter customer name"
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                />
              </div>

              <div>
                <Label>Consignee</Label>
                <Input 
                  placeholder="Enter consignee"
                  value={formData.consignee}
                  onChange={(e) => handleInputChange('consignee', e.target.value)}
                />
              </div>

              <div>
                <Label>Container Number</Label>
                <Input 
                  placeholder="Enter container number"
                  value={formData.container_number}
                  onChange={(e) => handleInputChange('container_number', e.target.value)}
                />
              </div>

              <div>
                <Label>Port</Label>
                <Select
                  value={formData.port}
                  onValueChange={(value) => handleInputChange('port', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Port of LA">Port of LA</SelectItem>
                    <SelectItem value="Long Beach Port">Long Beach Port</SelectItem>
                    <SelectItem value="Oakland Port">Oakland Port</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Route</Label>
                <Select
                  value={formData.route}
                  onValueChange={(value) => handleInputChange('route', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepull_drop_hook">Prepull + Drop & Hook</SelectItem>
                    <SelectItem value="prepull_live_unload">Prepull + Live Unload</SelectItem>
                    <SelectItem value="pick_run_drop_hook">Pick and Run + Drop & Hook</SelectItem>
                    <SelectItem value="one_way_move">One Way Move</SelectItem>
                    <SelectItem value="pick_run_live_unload">Pick and Run + Live Unload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Load"}
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center"
              onDrop={handleDrop}
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
            >
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p>Processing file...</p>
                </div>
              ) : step === 1 ? (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-4" />
                  <p className="text-lg mb-2">Drag & drop your file here</p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    Browse Files
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {previewData?.imagePreview && (
                    <img
                      src={previewData.imagePreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded"
                    />
                  )}
                  <div className="space-y-4">
                    <div>
                      <Label>Load Type</Label>
                      <Select
                        value={formData.load_type}
                        onValueChange={(value) => handleInputChange('load_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select load type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="import">Import</SelectItem>
                          <SelectItem value="export">Export</SelectItem>
                          <SelectItem value="road">Road</SelectItem>
                          <SelectItem value="bill_only">Bill Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Customer</Label>
                      <Input 
                        placeholder="Enter customer name"
                        value={formData.customer}
                        onChange={(e) => handleInputChange('customer', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Consignee</Label>
                      <Input 
                        placeholder="Enter consignee"
                        value={formData.consignee}
                        onChange={(e) => handleInputChange('consignee', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Container Number</Label>
                      <Input 
                        placeholder="Enter container number"
                        value={formData.container_number}
                        onChange={(e) => handleInputChange('container_number', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Port</Label>
                      <Select
                        value={formData.port}
                        onValueChange={(value) => handleInputChange('port', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select port" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Port of LA">Port of LA</SelectItem>
                          <SelectItem value="Long Beach Port">Long Beach Port</SelectItem>
                          <SelectItem value="Oakland Port">Oakland Port</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Route</Label>
                      <Select
                        value={formData.route}
                        onValueChange={(value) => handleInputChange('route', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prepull_drop_hook">Prepull + Drop & Hook</SelectItem>
                          <SelectItem value="prepull_live_unload">Prepull + Live Unload</SelectItem>
                          <SelectItem value="pick_run_drop_hook">Pick and Run + Drop & Hook</SelectItem>
                          <SelectItem value="one_way_move">One Way Move</SelectItem>
                          <SelectItem value="pick_run_live_unload">Pick and Run + Live Unload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep(1);
                          setPreviewData(null);
                          setFormData({
                            load_type: "",
                            customer: "",
                            port: "",
                            consignee: "",
                            container_number: "",
                            route: "",
                            status: "pending"
                          });
                        }}
                      >
                        Upload Another
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Load"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NewLoad;