import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Save, FileText, Send } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
// Import the AIAssistant component
import AIAssistant from "./AIAssistant";
import ActionTable from "./ActionTable";

interface ReportBuilderProps {
  homeId?: string;
  visitId?: string;
  initialData?: ReportData;
  onSave?: (data: ReportData) => void;
}

interface ReportData {
  homeId: string;
  visitDate: Date;
  visitType: string;
  summary: string;
  voiceOfChild: string;
  environment: string;
  staffDiscussion: string;
  recordsReviewed: string;
  compliance: string;
  actions: Action[];
}

interface Action {
  id: string;
  action: string;
  assignedTo: string;
  deadline: Date;
  status: "Not Started" | "In Progress" | "Completed";
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  homeId = "",
  visitId = "",
  initialData,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [date, setDate] = useState<Date | undefined>(
    initialData?.visitDate || new Date(),
  );
  const [visitType, setVisitType] = useState<string>(
    initialData?.visitType || "Announced",
  );
  const [reportData, setReportData] = useState<ReportData>(
    initialData || {
      homeId: homeId,
      visitDate: new Date(),
      visitType: "Announced",
      summary: "",
      voiceOfChild: "",
      environment: "",
      staffDiscussion: "",
      recordsReviewed: "",
      compliance: "",
      actions: [],
    },
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to a database
      if (onSave) {
        onSave(reportData);
      }
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionsUpdate = (actions: Action[]) => {
    setReportData((prev) => ({
      ...prev,
      actions,
    }));
  };

  const handleAIGenerate = (field: keyof ReportData, content: string) => {
    setReportData((prev) => ({
      ...prev,
      [field]: content,
    }));
    setShowAIAssistant(false);
  };

  return (
    <div className="container mx-auto p-4 bg-background">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regulation 44 Report Builder</CardTitle>
          <CardDescription>
            Create a detailed report for your Regulation 44 visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="details">Visit Details</TabsTrigger>
              <TabsTrigger value="observations">Observations</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="home-name">Home Name</Label>
                  <Input
                    id="home-name"
                    placeholder="Enter home name"
                    value={reportData.homeId}
                    onChange={(e) =>
                      handleInputChange("homeId", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit-type">Visit Type</Label>
                  <Select
                    value={visitType}
                    onValueChange={(value) => {
                      setVisitType(value);
                      handleInputChange("visitType", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Announced">Announced</SelectItem>
                      <SelectItem value="Unannounced">Unannounced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          if (newDate) {
                            handleInputChange(
                              "visitDate",
                              newDate as unknown as string,
                            );
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary of Visit</Label>
                <Textarea
                  id="summary"
                  placeholder="Provide a summary of your visit"
                  className="min-h-[120px]"
                  value={reportData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="observations" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-of-child">Voice of the Child</Label>
                  <Textarea
                    id="voice-of-child"
                    placeholder="Document children's views, wishes, and feelings"
                    className="min-h-[150px]"
                    value={reportData.voiceOfChild}
                    onChange={(e) =>
                      handleInputChange("voiceOfChild", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">
                    Observations of the Environment
                  </Label>
                  <Textarea
                    id="environment"
                    placeholder="Describe the physical environment, safety, and suitability"
                    className="min-h-[150px]"
                    value={reportData.environment}
                    onChange={(e) =>
                      handleInputChange("environment", e.target.value)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussions" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-discussion">
                    Staff & Management Discussion
                  </Label>
                  <Textarea
                    id="staff-discussion"
                    placeholder="Document discussions with staff and management"
                    className="min-h-[150px]"
                    value={reportData.staffDiscussion}
                    onChange={(e) =>
                      handleInputChange("staffDiscussion", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="records-reviewed">Records Reviewed</Label>
                  <Textarea
                    id="records-reviewed"
                    placeholder="List and comment on records reviewed during the visit"
                    className="min-h-[150px]"
                    value={reportData.recordsReviewed}
                    onChange={(e) =>
                      handleInputChange("recordsReviewed", e.target.value)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance">Compliance & Concerns</Label>
                <Textarea
                  id="compliance"
                  placeholder="Document compliance with regulations and any concerns identified"
                  className="min-h-[200px]"
                  value={reportData.compliance}
                  onChange={(e) =>
                    handleInputChange("compliance", e.target.value)
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <ActionTable
                actions={reportData.actions}
                onActionsChange={handleActionsUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAIAssistant(true)}>
              AI Assistant
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(getPreviousTab(activeTab))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab(getNextTab(activeTab))}
            >
              Next
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" /> Save Report
                </span>
              )}
            </Button>
            <Button variant="secondary">
              <Send className="mr-2 h-4 w-4" /> Submit Report
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showAIAssistant && (
        <AIAssistant
          reportData={reportData}
          onGenerate={handleAIGenerate}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
};

const getPreviousTab = (currentTab: string): string => {
  const tabs = [
    "details",
    "observations",
    "discussions",
    "compliance",
    "actions",
  ];
  const currentIndex = tabs.indexOf(currentTab);
  return currentIndex > 0 ? tabs[currentIndex - 1] : currentTab;
};

const getNextTab = (currentTab: string): string => {
  const tabs = [
    "details",
    "observations",
    "discussions",
    "compliance",
    "actions",
  ];
  const currentIndex = tabs.indexOf(currentTab);
  return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : currentTab;
};

export default ReportBuilder;
