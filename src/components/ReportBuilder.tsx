import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Upload,
  X,
  Save,
  Send,
  Download,
  Sparkles,
  Calendar,
  MapPin,
  Building,
  Clock,
  Eye,
  Share2,
  Copy,
  CheckCircle,
  AlertCircle,
  Plus,
  User,
  Target,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface ReportSection {
  id: string;
  title: string;
  content: string;
  images: File[];
  isRecording: boolean;
}

interface Action {
  id: string;
  description: string;
  responsiblePerson: string;
  deadline: string;
  status: "not-started" | "in-progress" | "completed";
  createdDate: string;
  homeId: string;
}

interface ReportData {
  homeName: string;
  homeAddress: string;
  visitDate: string;
  visitType: "announced" | "unannounced" | "";
  sections: ReportSection[];
  actions: Action[];
  recommendationsSummary: string;
}

interface ReportVersion {
  id: string;
  timestamp: Date;
  status: "draft" | "submitted";
  data: ReportData;
  description: string;
}

type ViewMode = "create" | "review";

const REPORT_SECTIONS = [
  { id: "summary", title: "Summary of Visit" },
  { id: "voice", title: "Voice of the Child" },
  { id: "environment", title: "Observations of the Environment" },
  { id: "staff", title: "Staff & Management Discussion" },
  { id: "records", title: "Records Reviewed" },
  { id: "compliance", title: "Compliance & Concerns" },
  { id: "recommendations", title: "Recommendations & Actions" },
];

const ReportBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("create");
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [newAction, setNewAction] = useState({
    description: "",
    responsiblePerson: "",
    deadline: "",
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [generateChildFriendly, setGenerateChildFriendly] = useState(false);
  const [childFriendlySummary, setChildFriendlySummary] = useState("");
  const [isGeneratingChildFriendly, setIsGeneratingChildFriendly] =
    useState(false);

  const [reportData, setReportData] = useState<ReportData>({
    homeName: searchParams.get("homeName") || "Sample Children's Home",
    homeAddress:
      searchParams.get("homeAddress") || "123 Oak Street, Manchester",
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "",
    sections: REPORT_SECTIONS.map((section) => ({
      id: section.id,
      title: section.title,
      content: "",
      images: [],
      isRecording: false,
    })),
    actions: [],
    recommendationsSummary: "",
  });

  // Load existing actions for this home
  useEffect(() => {
    const homeId = searchParams.get("homeId") || "sample-home";
    const savedActions = localStorage.getItem(`actions-${homeId}`);
    if (savedActions) {
      const actions: Action[] = JSON.parse(savedActions);
      const incompleteActions = actions.filter(
        (action) => action.status !== "completed",
      );

      // Pre-fill incomplete actions into recommendations section
      if (incompleteActions.length > 0) {
        const recommendationsSection = reportData.sections.find(
          (s) => s.id === "recommendations",
        );
        // Carry forward incomplete actions
        setReportData((prev) => ({
          ...prev,
          actions: actions,
        }));
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      handleSaveDraft(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [reportData]);

  const handleSaveDraft = (isAutoSave = false) => {
    // In a real app, this would save to a backend
    localStorage.setItem("reportDraft", JSON.stringify(reportData));
    setLastSaved(new Date());
    if (!isAutoSave) {
      // Show toast notification for manual saves
      console.log("Draft saved successfully");
    }
  };

  const handleSectionContentChange = (sectionId: string, content: string) => {
    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, content } : section,
      ),
    }));
  };

  const handleImageUpload = (sectionId: string, files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png",
    );

    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, images: [...section.images, ...validFiles] }
          : section,
      ),
    }));
  };

  const removeImage = (sectionId: string, imageIndex: number) => {
    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              images: section.images.filter((_, index) => index !== imageIndex),
            }
          : section,
      ),
    }));
  };

  const startRecording = async (sectionId: string) => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, isRecording: true } : section,
      ),
    }));

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        const currentSection = reportData.sections.find(
          (s) => s.id === sectionId,
        );
        const newContent = currentSection?.content
          ? `${currentSection.content} ${finalTranscript}`
          : finalTranscript;
        handleSectionContentChange(sectionId, newContent);
      }
    };

    recognition.onerror = () => {
      setReportData((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId
            ? { ...section, isRecording: false }
            : section,
        ),
      }));
    };

    recognition.onend = () => {
      setReportData((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId
            ? { ...section, isRecording: false }
            : section,
        ),
      }));
    };

    recognition.start();
  };

  const stopRecording = (sectionId: string) => {
    setReportData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, isRecording: false } : section,
      ),
    }));
  };

  const generateAISummary = async () => {
    setIsGeneratingAI(true);

    // Simulate AI generation (in real app, this would call OpenAI API)
    setTimeout(() => {
      // Collect content from specific report sections (excluding recommendations)
      const reportSections = reportData.sections
        .filter(
          (section) =>
            section.id !== "recommendations" && section.content.trim(),
        )
        .map((section) => ({ title: section.title, content: section.content }));

      // Format actions from the Recommendations & Actions table
      const actionsText =
        reportData.actions.length > 0
          ? reportData.actions
              .map(
                (action, index) =>
                  `${index + 1}. ${action.description}\n   Responsible: ${action.responsiblePerson}\n   Deadline: ${new Date(action.deadline).toLocaleDateString()}\n   Status: ${action.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
              )
              .join("\n\n")
          : "No specific actions identified during this visit.";

      // Build the comprehensive AI summary
      let aiSummary = `# Regulation 44 Visit Report\n\n`;

      // Header Information
      aiSummary += `**Home:** ${reportData.homeName}\n`;
      aiSummary += `**Address:** ${reportData.homeAddress}\n`;
      aiSummary += `**Date of Visit:** ${new Date(reportData.visitDate).toLocaleDateString()}\n`;
      aiSummary += `**Type of Visit:** ${reportData.visitType ? reportData.visitType.charAt(0).toUpperCase() + reportData.visitType.slice(1) : "Not specified"}\n\n`;

      // Executive Summary
      aiSummary += `## Executive Summary\n\n`;
      aiSummary += `This report documents the findings from the Regulation 44 visit conducted at ${reportData.homeName}. `;
      aiSummary += `The ${reportData.visitType || "scheduled"} visit assessed compliance with regulatory requirements and the quality of care provided to children and young people.\n\n`;

      // Detailed Findings by Section
      if (reportSections.length > 0) {
        aiSummary += `## Detailed Findings\n\n`;
        reportSections.forEach((section) => {
          aiSummary += `### ${section.title}\n\n`;
          aiSummary += `${section.content}\n\n`;
        });
      }

      // Recommendations Summary
      if (reportData.recommendationsSummary.trim()) {
        aiSummary += `## Recommendations Summary\n\n`;
        aiSummary += `${reportData.recommendationsSummary}\n\n`;
      }

      // Actions and Recommendations
      aiSummary += `## Actions and Recommendations\n\n`;
      aiSummary += `${actionsText}\n\n`;

      // Overall Assessment
      aiSummary += `## Overall Assessment\n\n`;
      if (reportSections.length > 0) {
        aiSummary += `Based on the observations and discussions during this visit, the following key areas have been identified for attention. `;
        aiSummary += `The home demonstrates commitment to providing quality care, with specific recommendations outlined above to support continuous improvement.\n\n`;
      } else {
        aiSummary += `This visit focused on specific areas of concern and compliance. Detailed observations and recommendations are documented in the actions section above.\n\n`;
      }

      // Next Steps
      aiSummary += `## Next Steps\n\n`;
      aiSummary += `- Implementation of recommendations within specified timeframes\n`;
      aiSummary += `- Follow-up monitoring of action items\n`;
      aiSummary += `- Schedule next regulatory visit as per requirements\n`;
      aiSummary += `- Ongoing communication with registered manager regarding progress\n\n`;

      // Footer
      aiSummary += `---\n\n`;
      aiSummary += `*This report has been generated using AI assistance and should be reviewed for accuracy and completeness before submission.*`;

      setAiGeneratedContent(aiSummary);
      setIsGeneratingAI(false);
    }, 2000);
  };

  const generateChildFriendlySummary = async () => {
    setIsGeneratingChildFriendly(true);

    // Simulate AI generation for child-friendly summary
    setTimeout(() => {
      const summarySection = reportData.sections.find(
        (s) => s.id === "summary",
      );
      const voiceSection = reportData.sections.find((s) => s.id === "voice");
      const environmentSection = reportData.sections.find(
        (s) => s.id === "environment",
      );

      let childFriendlyText = `# What We Found During Our Visit to ${reportData.homeName}\n\n`;

      childFriendlyText += `Hi everyone! We visited your home on ${new Date(reportData.visitDate).toLocaleDateString()} to see how things are going and to make sure you're getting the best care possible.\n\n`;

      // Add positive findings
      childFriendlyText += `## The Good Things We Noticed\n\n`;
      childFriendlyText += `• Your home feels welcoming and comfortable\n`;
      childFriendlyText += `• The staff care about making sure you're happy and safe\n`;
      childFriendlyText += `• There are lots of activities and opportunities for you to enjoy\n`;
      childFriendlyText += `• Your voices and opinions are being heard\n\n`;

      // Add what young people told us
      if (voiceSection?.content) {
        childFriendlyText += `## What You Told Us\n\n`;
        childFriendlyText += `We really enjoyed talking with some of you during our visit. It's important that we hear your thoughts and feelings about living here. Thank you for being so open and honest with us!\n\n`;
      }

      // Add improvements being made
      if (reportData.actions.length > 0) {
        childFriendlyText += `## Changes and Improvements Coming\n\n`;
        childFriendlyText += `We've talked with the staff about some ways to make things even better for you:\n\n`;

        reportData.actions.forEach((action, index) => {
          // Simplify action descriptions for young people
          let simplifiedAction = action.description;
          if (simplifiedAction.length > 100) {
            simplifiedAction = simplifiedAction.substring(0, 100) + "...";
          }
          childFriendlyText += `• ${simplifiedAction}\n`;
        });
        childFriendlyText += `\n`;
      }

      // Add who to talk to
      childFriendlyText += `## If You Have Questions or Want to Talk\n\n`;
      childFriendlyText += `Remember, you can always talk to:\n`;
      childFriendlyText += `• Your key worker or any member of staff\n`;
      childFriendlyText += `• The home manager\n`;
      childFriendlyText += `• Your social worker\n`;
      childFriendlyText += `• The Independent Person (that's us!) - we visit regularly to make sure everything is going well\n\n`;

      childFriendlyText += `Your thoughts and feelings matter, and there are always people here who want to listen and help.\n\n`;

      childFriendlyText += `## What Happens Next\n\n`;
      childFriendlyText += `We'll keep checking in to see how the improvements are going, and we'll be back for another visit soon. Keep being amazing!\n\n`;

      childFriendlyText += `---\n\n`;
      childFriendlyText += `*This summary was created especially for the young people living at ${reportData.homeName}. It explains our visit in a way that's easy to understand.*`;

      setChildFriendlySummary(childFriendlyText);
      setIsGeneratingChildFriendly(false);
    }, 2000);
  };

  const handleSubmitFinalReport = async () => {
    // Generate child-friendly summary if requested
    if (generateChildFriendly && !childFriendlySummary) {
      await generateChildFriendlySummary();
    }

    // In a real app, this would submit to backend and notify stakeholders
    setIsReportSubmitted(true);
    setViewMode("review");
    handleSaveDraft();
  };

  const handleAddAction = () => {
    if (
      !newAction.description ||
      !newAction.responsiblePerson ||
      !newAction.deadline
    ) {
      alert("Please fill in all action fields");
      return;
    }

    const action: Action = {
      id: Date.now().toString(),
      description: newAction.description,
      responsiblePerson: newAction.responsiblePerson,
      deadline: newAction.deadline,
      status: "not-started",
      createdDate: new Date().toISOString(),
      homeId: searchParams.get("homeId") || "sample-home",
    };

    setReportData((prev) => ({
      ...prev,
      actions: [...prev.actions, action],
    }));

    // Save to localStorage
    const homeId = searchParams.get("homeId") || "sample-home";
    const updatedActions = [...reportData.actions, action];
    localStorage.setItem(`actions-${homeId}`, JSON.stringify(updatedActions));

    setNewAction({ description: "", responsiblePerson: "", deadline: "" });
  };

  const handleUpdateActionStatus = (
    actionId: string,
    status: Action["status"],
  ) => {
    const updatedActions = reportData.actions.map((action) =>
      action.id === actionId ? { ...action, status } : action,
    );

    setReportData((prev) => ({
      ...prev,
      actions: updatedActions,
    }));

    // Save to localStorage
    const homeId = searchParams.get("homeId") || "sample-home";
    localStorage.setItem(`actions-${homeId}`, JSON.stringify(updatedActions));
  };

  const generateSecureLink = () => {
    // In a real app, this would generate a secure, time-limited link
    const reportId = `report-${Date.now()}`;
    const secureLink = `${window.location.origin}/shared-report/${reportId}`;
    navigator.clipboard.writeText(secureLink);
    alert("Secure link copied to clipboard!");
  };

  const handleShareReport = () => {
    if (!reviewConfirmed) {
      alert("Please confirm that you have reviewed the report before sharing.");
      return;
    }
    generateSecureLink();
    setShareDialogOpen(false);
  };

  const handleDownloadChildFriendlyPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let yPosition = margin;
    let pageNumber = 1;

    // Helper function to add page numbers and footer
    const addFooter = () => {
      const now = new Date();
      const timestamp = `Child-friendly summary generated on ${now.toLocaleDateString("en-GB")} at ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(timestamp, margin, pageHeight - 15);
      pdf.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - 15);
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = margin;
      }
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(0, 0, 0);

      const maxWidth = pageWidth - 2 * margin;
      const lines = pdf.splitTextToSize(text, maxWidth);

      for (const line of lines) {
        checkNewPage();
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
    };

    // Header Section
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Child-Friendly Visit Summary", margin, yPosition);
    yPosition += 15;

    // Add the child-friendly content
    const content = childFriendlySummary
      .replace(/^# /, "")
      .replace(/\n## /g, "\n\n")
      .replace(/\n\n/g, "\n");
    addWrappedText(content, 11);

    // Add footer to last page
    addFooter();

    // Download the PDF
    const fileName = `Child_Friendly_Summary_${reportData.homeName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let yPosition = margin;
    let pageNumber = 1;

    // Helper function to add page numbers and footer
    const addFooter = () => {
      const now = new Date();
      const timestamp = `Report generated on ${now.toLocaleDateString("en-GB")} at ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(timestamp, margin, pageHeight - 15);
      pdf.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - 15);
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = margin;
      }
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(0, 0, 0);

      const maxWidth = pageWidth - 2 * margin;
      const lines = pdf.splitTextToSize(text, maxWidth);

      for (const line of lines) {
        checkNewPage();
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
    };

    // Header Section
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Regulation 44 Visit Report", margin, yPosition);
    yPosition += 15;

    // Home Information
    addWrappedText(`Home: ${reportData.homeName}`, 12, true);
    yPosition += 2;
    addWrappedText(`Address: ${reportData.homeAddress}`, 10);
    yPosition += 2;
    addWrappedText(
      `Date of Visit: ${new Date(reportData.visitDate).toLocaleDateString("en-GB")}`,
      10,
    );
    yPosition += 2;
    addWrappedText(
      `Type of Visit: ${reportData.visitType ? reportData.visitType.charAt(0).toUpperCase() + reportData.visitType.slice(1) : "Not specified"}`,
      10,
    );
    yPosition += 15;

    // Report Sections
    const sectionsToInclude = reportData.sections.filter(
      (section) => section.id !== "recommendations" && section.content.trim(),
    );

    sectionsToInclude.forEach((section) => {
      checkNewPage(30);
      addWrappedText(section.title, 14, true);
      yPosition += 5;
      addWrappedText(section.content, 10);
      yPosition += 10;
    });

    // Recommendations Summary (if exists)
    if (reportData.recommendationsSummary.trim()) {
      checkNewPage(30);
      addWrappedText("Recommendations Summary", 14, true);
      yPosition += 5;
      addWrappedText(reportData.recommendationsSummary, 10);
      yPosition += 10;
    }

    // Recommendations & Actions Section
    if (reportData.actions.length > 0) {
      checkNewPage(50);
      addWrappedText("Recommendations & Actions", 14, true);
      yPosition += 10;

      // Table header
      const tableStartY = yPosition;
      const colWidths = [80, 40, 30, 30]; // Action, Responsible, Deadline, Status
      const colPositions = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
      ];

      // Draw table header
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, "F");

      pdf.text("Action", colPositions[0] + 2, yPosition);
      pdf.text("Responsible Person", colPositions[1] + 2, yPosition);
      pdf.text("Deadline", colPositions[2] + 2, yPosition);
      pdf.text("Status", colPositions[3] + 2, yPosition);
      yPosition += 10;

      // Draw table rows
      pdf.setFont("helvetica", "normal");
      reportData.actions.forEach((action, index) => {
        const rowHeight = Math.max(
          pdf.splitTextToSize(action.description, colWidths[0] - 4).length * 4,
          pdf.splitTextToSize(action.responsiblePerson, colWidths[1] - 4)
            .length * 4,
          8,
        );

        checkNewPage(rowHeight + 5);

        // Draw row background (alternating)
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(
            margin,
            yPosition - 3,
            pageWidth - 2 * margin,
            rowHeight,
            "F",
          );
        }

        // Add cell content
        const actionLines = pdf.splitTextToSize(
          action.description,
          colWidths[0] - 4,
        );
        const responsibleLines = pdf.splitTextToSize(
          action.responsiblePerson,
          colWidths[1] - 4,
        );

        let cellY = yPosition;
        actionLines.forEach((line) => {
          pdf.text(line, colPositions[0] + 2, cellY);
          cellY += 4;
        });

        cellY = yPosition;
        responsibleLines.forEach((line) => {
          pdf.text(line, colPositions[1] + 2, cellY);
          cellY += 4;
        });

        pdf.text(
          new Date(action.deadline).toLocaleDateString("en-GB"),
          colPositions[2] + 2,
          yPosition,
        );
        pdf.text(
          action.status
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          colPositions[3] + 2,
          yPosition,
        );

        yPosition += rowHeight + 2;
      });

      // Draw table borders
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);

      // Vertical lines
      colPositions.forEach((pos) => {
        pdf.line(pos, tableStartY - 5, pos, yPosition - 2);
      });
      pdf.line(
        pageWidth - margin,
        tableStartY - 5,
        pageWidth - margin,
        yPosition - 2,
      );

      // Horizontal lines
      pdf.line(margin, tableStartY - 5, pageWidth - margin, tableStartY - 5);
      pdf.line(margin, tableStartY + 5, pageWidth - margin, tableStartY + 5);
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    }

    // Add footer to last page
    addFooter();

    // Download the PDF
    const fileName = `Regulation44_Report_${reportData.homeName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
  };

  const saveVersion = (status: "draft" | "submitted", description: string) => {
    const homeId = searchParams.get("homeId") || "sample-home";
    const reportId =
      searchParams.get("reportId") ||
      `report-${homeId}-${new Date().toISOString().split("T")[0]}`;

    const newVersion: ReportVersion = {
      id: `version-${Date.now()}`,
      timestamp: new Date(),
      status,
      data: JSON.parse(JSON.stringify(reportData)), // Deep copy
      description,
    };

    // Keep only the most recent 2 versions (including the new one)
    const updatedVersions = [...reportVersions, newVersion]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 2);

    setReportVersions(updatedVersions);

    // Save to localStorage
    localStorage.setItem(
      `report-versions-${reportId}`,
      JSON.stringify(updatedVersions),
    );
    localStorage.setItem("reportDraft", JSON.stringify(reportData));

    return newVersion;
  };

  const renderReviewScreen = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Report Review Header */}
      <Card className="mb-8 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Report Review - {reportData.homeName}
          </CardTitle>
          <CardDescription>
            Review your submitted report before sharing with stakeholders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Home Name
                </Label>
                <p className="text-sm">{reportData.homeName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Visit Date
                </Label>
                <p className="text-sm">
                  {new Date(reportData.visitDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Visit Type
                </Label>
                <p className="text-sm capitalize">
                  {reportData.visitType || "Not specified"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {reportData.sections
                .filter((section) => section.content)
                .map((section) => (
                  <div
                    key={section.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      {section.title}
                    </h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {section.content}
                    </div>
                    {section.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Attached Images:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {section.images.map((image, index) => (
                            <img
                              key={index}
                              src={URL.createObjectURL(image)}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {reportData.recommendationsSummary && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  Recommendations Summary
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {reportData.recommendationsSummary}
                </div>
              </div>
            )}

            {reportData.actions.length > 0 && (
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  Actions & Recommendations
                </h3>
                <div className="space-y-2">
                  {reportData.actions.map((action) => (
                    <div
                      key={action.id}
                      className="text-sm text-gray-700 bg-gray-50 p-3 rounded"
                    >
                      <p className="font-medium">{action.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                        <span>Responsible: {action.responsiblePerson}</span>
                        <span>
                          Deadline:{" "}
                          {new Date(action.deadline).toLocaleDateString()}
                        </span>
                        <span className="capitalize">
                          Status: {action.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiGeneratedContent && (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  AI-Generated Summary
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {aiGeneratedContent}
                </div>
              </div>
            )}

            {childFriendlySummary && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  Child-Friendly Summary
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 p-3 rounded">
                  {childFriendlySummary}
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(childFriendlySummary)
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadChildFriendlyPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card className="mb-8 bg-white">
        <CardHeader>
          <CardTitle>Share Report</CardTitle>
          <CardDescription>
            Confirm your review and share the report with stakeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="review-confirmed"
              checked={reviewConfirmed}
              onCheckedChange={(checked) => setReviewConfirmed(!!checked)}
            />
            <Label htmlFor="review-confirmed" className="text-sm">
              I have reviewed this report and am ready to share externally
            </Label>
          </div>

          {childFriendlySummary && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-800">
                  <p className="font-medium mb-1">
                    Child-Friendly Summary Available
                  </p>
                  <p>
                    A simplified, age-appropriate version of this report has
                    been generated for internal use. This can help you prepare
                    accessible information for young people in the home.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!reviewConfirmed}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Report</DialogTitle>
                  <DialogDescription>
                    Generate a secure link to share this report with
                    stakeholders.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    A secure, time-limited link will be generated that you can
                    share with:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Ofsted</li>
                    <li>Registered Manager</li>
                    <li>Responsible Individual</li>
                    <li>Other authorized personnel</li>
                  </ul>
                  <div className="flex space-x-2">
                    <Button onClick={handleShareReport} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Secure Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShareDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {viewMode === "review"
                    ? "Report Review"
                    : "New Regulation 44 Report"}
                </h1>
                {lastSaved && viewMode === "create" && (
                  <p className="text-sm text-gray-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {viewMode === "create" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveDraft()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Final Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Submit Report</DialogTitle>
                        <DialogDescription>
                          Choose your submission options before finalizing the
                          report.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="generate-child-friendly"
                            checked={generateChildFriendly}
                            onCheckedChange={(checked) =>
                              setGenerateChildFriendly(!!checked)
                            }
                          />
                          <div>
                            <Label
                              htmlFor="generate-child-friendly"
                              className="text-sm font-medium"
                            >
                              Generate a child-friendly summary
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                              Create a simplified, positive version of the
                              report summary that's easy for young people to
                              understand. This is for internal use only.
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={handleSubmitFinalReport}
                            className="flex-1"
                          >
                            {isGeneratingChildFriendly ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Report
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="create" disabled={isReportSubmitted}>
                  Create Report
                </TabsTrigger>
                <TabsTrigger value="review" disabled={!isReportSubmitted}>
                  Review Report
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {viewMode === "review" && renderReviewScreen()}

      {viewMode === "create" && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Visit Information */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Visit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="homeName">Home Name</Label>
                  <Input
                    id="homeName"
                    value={reportData.homeName}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        homeName: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="visitDate">Date of Visit</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="visitDate"
                      type="date"
                      value={reportData.visitDate}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          visitDate: e.target.value,
                        }))
                      }
                      className="mt-1 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Home Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    value={reportData.homeAddress}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        homeAddress: e.target.value,
                      }))
                    }
                    className="mt-1 pl-10"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label>Type of Visit</Label>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="announced"
                      checked={reportData.visitType === "announced"}
                      onCheckedChange={(checked) =>
                        setReportData((prev) => ({
                          ...prev,
                          visitType: checked ? "announced" : "",
                        }))
                      }
                    />
                    <Label htmlFor="announced">Announced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unannounced"
                      checked={reportData.visitType === "unannounced"}
                      onCheckedChange={(checked) =>
                        setReportData((prev) => ({
                          ...prev,
                          visitType: checked ? "unannounced" : "",
                        }))
                      }
                    />
                    <Label htmlFor="unannounced">Unannounced</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Sections */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle>Report Sections</CardTitle>
              <CardDescription>
                Complete each section with your observations and findings. Use
                the microphone to dictate notes or upload images as evidence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {reportData.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span>{section.title}</span>
                        <div className="flex items-center space-x-2">
                          {section.id === "recommendations" &&
                            reportData.recommendationsSummary && (
                              <Badge variant="secondary" className="text-xs">
                                Summary:{" "}
                                {reportData.recommendationsSummary.length} chars
                              </Badge>
                            )}
                          {section.id === "recommendations" &&
                            reportData.actions.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {reportData.actions.length} action
                                {reportData.actions.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          {section.id !== "recommendations" &&
                            section.content && (
                              <Badge variant="secondary" className="text-xs">
                                {section.content.length} chars
                              </Badge>
                            )}
                          {section.images.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {section.images.length} image
                              {section.images.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          {section.isRecording && (
                            <Badge
                              variant="destructive"
                              className="text-xs animate-pulse"
                            >
                              Recording
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {section.id === "recommendations" ? (
                        /* Recommendations & Actions Section with embedded Action Tracker */
                        <div className="space-y-6">
                          {/* Summary Field */}
                          <div>
                            <Label htmlFor="recommendations-summary">
                              Summary of Recommendations (Optional)
                            </Label>
                            <Textarea
                              id="recommendations-summary"
                              value={reportData.recommendationsSummary}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  recommendationsSummary: e.target.value,
                                }))
                              }
                              placeholder="Enter a short summary of this month's recommendations..."
                              className="mt-1 min-h-[80px]"
                            />
                          </div>

                          {/* Actions Table */}
                          <div>
                            <Label className="text-base font-medium">
                              Actions & Recommendations
                            </Label>
                            <div className="mt-2 border rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[40%]">
                                      Action Description
                                    </TableHead>
                                    <TableHead className="w-[25%]">
                                      Responsible Person
                                    </TableHead>
                                    <TableHead className="w-[20%]">
                                      Deadline
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {reportData.actions.length === 0 ? (
                                    <TableRow>
                                      <TableCell
                                        colSpan={4}
                                        className="text-center text-gray-500 py-8"
                                      >
                                        No actions have been added yet. Use the
                                        form below to add new actions.
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    reportData.actions.map((action) => (
                                      <TableRow key={action.id}>
                                        <TableCell>
                                          <Textarea
                                            value={action.description}
                                            onChange={(e) => {
                                              const updatedActions =
                                                reportData.actions.map((a) =>
                                                  a.id === action.id
                                                    ? {
                                                        ...a,
                                                        description:
                                                          e.target.value,
                                                      }
                                                    : a,
                                                );
                                              setReportData((prev) => ({
                                                ...prev,
                                                actions: updatedActions,
                                              }));
                                              const homeId =
                                                searchParams.get("homeId") ||
                                                "sample-home";
                                              localStorage.setItem(
                                                `actions-${homeId}`,
                                                JSON.stringify(updatedActions),
                                              );
                                            }}
                                            className="min-h-[60px] resize-none"
                                            placeholder="Action description..."
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={action.responsiblePerson}
                                            onChange={(e) => {
                                              const updatedActions =
                                                reportData.actions.map((a) =>
                                                  a.id === action.id
                                                    ? {
                                                        ...a,
                                                        responsiblePerson:
                                                          e.target.value,
                                                      }
                                                    : a,
                                                );
                                              setReportData((prev) => ({
                                                ...prev,
                                                actions: updatedActions,
                                              }));
                                              const homeId =
                                                searchParams.get("homeId") ||
                                                "sample-home";
                                              localStorage.setItem(
                                                `actions-${homeId}`,
                                                JSON.stringify(updatedActions),
                                              );
                                            }}
                                            placeholder="Responsible person..."
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="date"
                                            value={action.deadline}
                                            onChange={(e) => {
                                              const updatedActions =
                                                reportData.actions.map((a) =>
                                                  a.id === action.id
                                                    ? {
                                                        ...a,
                                                        deadline:
                                                          e.target.value,
                                                      }
                                                    : a,
                                                );
                                              setReportData((prev) => ({
                                                ...prev,
                                                actions: updatedActions,
                                              }));
                                              const homeId =
                                                searchParams.get("homeId") ||
                                                "sample-home";
                                              localStorage.setItem(
                                                `actions-${homeId}`,
                                                JSON.stringify(updatedActions),
                                              );
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Select
                                            value={action.status}
                                            onValueChange={(
                                              value: Action["status"],
                                            ) =>
                                              handleUpdateActionStatus(
                                                action.id,
                                                value,
                                              )
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="not-started">
                                                <div className="flex items-center">
                                                  <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                                                  Not Started
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="in-progress">
                                                <div className="flex items-center">
                                                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                                  In Progress
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="completed">
                                                <div className="flex items-center">
                                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                  Completed
                                                </div>
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          {/* Add New Action Section */}
                          <div className="border-t pt-4">
                            <Label className="text-base font-medium mb-4 block">
                              Add New Action
                            </Label>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="new-action-description">
                                  Action Description
                                </Label>
                                <Textarea
                                  id="new-action-description"
                                  value={newAction.description}
                                  onChange={(e) =>
                                    setNewAction((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  placeholder="Describe the action that needs to be taken..."
                                  className="mt-1 min-h-[80px]"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="new-responsible-person">
                                    Responsible Person
                                  </Label>
                                  <Input
                                    id="new-responsible-person"
                                    value={newAction.responsiblePerson}
                                    onChange={(e) =>
                                      setNewAction((prev) => ({
                                        ...prev,
                                        responsiblePerson: e.target.value,
                                      }))
                                    }
                                    placeholder="Who is responsible for this action?"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="new-action-deadline">
                                    Deadline
                                  </Label>
                                  <Input
                                    id="new-action-deadline"
                                    type="date"
                                    value={newAction.deadline}
                                    onChange={(e) =>
                                      setNewAction((prev) => ({
                                        ...prev,
                                        deadline: e.target.value,
                                      }))
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <Button
                                onClick={handleAddAction}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Action
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Regular Section Content */
                        <>
                          {/* Text Area */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Notes
                            </Label>
                            <Textarea
                              id={`content-${section.id}`}
                              value={section.content}
                              onChange={(e) =>
                                handleSectionContentChange(
                                  section.id,
                                  e.target.value,
                                )
                              }
                              placeholder={`Enter your observations for ${section.title.toLowerCase()}...`}
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                section.isRecording
                                  ? stopRecording(section.id)
                                  : startRecording(section.id)
                              }
                              className={
                                section.isRecording
                                  ? "bg-red-50 border-red-200"
                                  : ""
                              }
                            >
                              {section.isRecording ? (
                                <>
                                  <MicOff className="h-4 w-4 mr-2" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4 mr-2" />
                                  Dictate Notes
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                fileInputRefs.current[section.id]?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Images
                            </Button>

                            <input
                              ref={(el) =>
                                (fileInputRefs.current[section.id] = el)
                              }
                              type="file"
                              accept="image/jpeg,image/png"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(section.id, e.target.files)
                              }
                            />
                          </div>

                          {/* Uploaded Images */}
                          {section.images.length > 0 && (
                            <div>
                              <Label>Uploaded Images</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {section.images.map((image, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={URL.createObjectURL(image)}
                                      alt={`Evidence ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() =>
                                        removeImage(section.id, index)
                                      }
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {image.name}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* AI Summary Generation */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                AI-Generated Summary
              </CardTitle>
              <CardDescription>
                Generate a comprehensive report summary using AI based on all
                your inputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  onClick={generateAISummary}
                  disabled={isGeneratingAI}
                  className="flex-1"
                >
                  {isGeneratingAI ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary with AI
                    </>
                  )}
                </Button>

                <Button
                  onClick={generateChildFriendlySummary}
                  disabled={isGeneratingChildFriendly}
                  variant="outline"
                  className="flex-1"
                >
                  {isGeneratingChildFriendly ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Generate Child-Friendly Summary
                    </>
                  )}
                </Button>
              </div>

              {childFriendlySummary && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Child-Friendly Summary</Label>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-800"
                      >
                        Child-Friendly
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(childFriendlySummary)
                        }
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadChildFriendlyPDF}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChildFriendlySummary("")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <Textarea
                      value={childFriendlySummary}
                      onChange={(e) => setChildFriendlySummary(e.target.value)}
                      className="min-h-[300px] text-sm border-0 focus-visible:ring-0 resize-none"
                      placeholder="Child-friendly summary will appear here..."
                    />
                  </div>
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">
                          For Internal Use Only
                        </p>
                        <p>
                          This child-friendly summary is designed to help you
                          prepare accessible information for young people in the
                          home. You can edit the content above before saving or
                          sharing. This summary is not part of the formal report
                          submission.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={generateAISummary}
                disabled={isGeneratingAI}
                className="w-full"
              >
                {isGeneratingAI ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Summary with AI
                  </>
                )}
              </Button>

              {aiGeneratedContent && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Generated Report Summary</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        AI Generated
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAiGeneratedContent("")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <Textarea
                      value={aiGeneratedContent}
                      onChange={(e) => setAiGeneratedContent(e.target.value)}
                      className="min-h-[400px] text-sm border-0 focus-visible:ring-0 resize-none"
                      placeholder="AI-generated summary will appear here..."
                    />
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Review and Edit</p>
                        <p>
                          This AI-generated summary includes content from all
                          completed report sections and actions. Please review
                          and edit as needed before saving or sharing the
                          report.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sticky Action Bar */}
          <div className="sticky bottom-0 bg-white border-t p-4 -mx-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-sm text-gray-500">
                {lastSaved
                  ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                  : "Not saved yet"}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleSaveDraft()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Final Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Submit Report</DialogTitle>
                      <DialogDescription>
                        Choose your submission options before finalizing the
                        report.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="generate-child-friendly-sticky"
                          checked={generateChildFriendly}
                          onCheckedChange={(checked) =>
                            setGenerateChildFriendly(!!checked)
                          }
                        />
                        <div>
                          <Label
                            htmlFor="generate-child-friendly-sticky"
                            className="text-sm font-medium"
                          >
                            Generate a child-friendly summary
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Create a simplified, positive version of the report
                            summary that's easy for young people to understand.
                            This is for internal use only.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={handleSubmitFinalReport}
                          className="flex-1"
                        >
                          {isGeneratingChildFriendly ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Report
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilder;
