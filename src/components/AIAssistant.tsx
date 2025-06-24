import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIAssistantProps {
  reportData?: {
    summary?: string;
    voiceOfChild?: string;
    environment?: string;
    staffDiscussion?: string;
    recordsReviewed?: string;
    compliance?: string;
  };
  onGeneratedContent?: (content: { section: string; text: string }) => void;
}

const AIAssistant = ({
  reportData = {},
  onGeneratedContent = () => {},
}: AIAssistantProps) => {
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<
    Record<string, string>
  >({
    summary: "",
    voiceOfChild: "",
    environment: "",
    staffDiscussion: "",
    recordsReviewed: "",
    compliance: "",
  });
  const [selectedSection, setSelectedSection] = useState("summary");
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState("");

  const sections = [
    { id: "summary", name: "Summary of Visit" },
    { id: "voiceOfChild", name: "Voice of the Child" },
    { id: "environment", name: "Observations of the Environment" },
    { id: "staffDiscussion", name: "Staff & Management Discussion" },
    { id: "recordsReviewed", name: "Records Reviewed" },
    { id: "compliance", name: "Compliance & Concerns" },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    setError("");

    // Simulate AI generation with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);

          // Mock generated content
          const mockContent = {
            summary:
              "This visit was conducted on [date] at [home name]. The overall atmosphere was positive with staff engaged and children participating in various activities.",
            voiceOfChild:
              "Children reported feeling safe and supported. Several mentioned enjoying recent activities, particularly the weekend trip to the local park.",
            environment:
              "The home was clean, well-maintained and appropriately heated. Bedrooms were personalized and reflected children's interests. Common areas were tidy and welcoming.",
            staffDiscussion:
              "Staff reported good team communication and support from management. Recent training on trauma-informed care was highlighted as particularly valuable.",
            recordsReviewed:
              "Medication records were up-to-date and properly maintained. Incident reports were appropriately documented with clear follow-up actions.",
            compliance:
              "The home is generally compliant with regulations. Minor concern noted regarding documentation of fire drills which needs addressing.",
          };

          setGeneratedContent(mockContent);
          setActiveTab("review");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setEditingContent(generatedContent[sectionId] || "");
  };

  const handleEdit = () => {
    setActiveTab("edit");
  };

  const handleSaveEdit = () => {
    setGeneratedContent((prev) => ({
      ...prev,
      [selectedSection]: editingContent,
    }));
    onGeneratedContent({
      section: selectedSection,
      text: editingContent,
    });
    setActiveTab("review");
  };

  const handleApproveContent = () => {
    onGeneratedContent({
      section: selectedSection,
      text: generatedContent[selectedSection],
    });
  };

  const handleRegenerateSection = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate regenerating just this section
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);

          // Mock regenerated content for this section
          const newContent = `Regenerated content for ${sections.find((s) => s.id === selectedSection)?.name}. This is an alternative version that provides a different perspective on the same information.`;

          setGeneratedContent((prev) => ({
            ...prev,
            [selectedSection]: newContent,
          }));
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <Card className="w-full bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Report Assistant
        </CardTitle>
        <CardDescription>
          Generate and refine report content using AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Available Input Data</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center gap-2">
                      <Badge
                        variant={reportData[section.id] ? "default" : "outline"}
                      >
                        {reportData[section.id] ? "Data Available" : "No Data"}
                      </Badge>
                      <span className="text-sm">{section.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  AI will generate content based on available data
                </AlertTitle>
                <AlertDescription>
                  For best results, provide notes in at least some of the report
                  sections before generating.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>Generate Draft Report</>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Generating content...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-4 border-r pr-4">
                <h3 className="text-sm font-medium">Report Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={
                        selectedSection === section.id ? "default" : "outline"
                      }
                      className="w-full justify-start text-left"
                      onClick={() => handleSectionSelect(section.id)}
                    >
                      {section.name}
                      {generatedContent[section.id] && (
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {sections.find((s) => s.id === selectedSection)?.name}
                  </h3>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerateSection}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button size="sm" onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-gray-50 min-h-[200px]">
                  {generatedContent[selectedSection] ||
                    "No content generated yet"}
                </div>

                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Not Helpful
                    </Button>
                    <Button size="sm" variant="outline">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Helpful
                    </Button>
                  </div>

                  <Button size="sm" onClick={handleApproveContent}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Use
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Editing: {sections.find((s) => s.id === selectedSection)?.name}
              </h3>

              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="min-h-[300px]"
                placeholder="Edit the generated content here..."
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("review")}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-4">
        <div className="text-xs text-gray-500">
          <p>
            AI-generated content should always be reviewed for accuracy before
            submission.
          </p>
          <p>
            Content is generated based on the information you've provided in the
            report form.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAssistant;
