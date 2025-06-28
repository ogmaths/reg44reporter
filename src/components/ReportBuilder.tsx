import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import { useToast } from "./ui/use-toast";
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
import { Switch } from "./ui/switch";
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
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  Mail,
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
  progressUpdate?: string;
}

interface ChildFeedback {
  id: string;
  initialsOrCode: string;
  age: string;
  summary: string;
  concernsRaised: boolean;
  actionTaken: string;
  includeInAISummary: boolean;
}

interface StaffFeedback {
  id: string;
  initialsOrCode: string;
  role: string;
  questionsAsked: string;
  keyPointsRaised: string;
  concernsRaised: boolean;
  includeInAISummary: boolean;
}

interface DocumentChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  notes: string;
}

interface FinalComments {
  safeguardingOpinion: "yes" | "no" | "not-sure" | "";
  safeguardingExplanation: string;
  wellbeingOpinion: "yes" | "no" | "not-sure" | "";
  wellbeingExplanation: string;
  recommendations: Array<{
    id: string;
    text: string;
    priority: "high" | "medium" | "low" | "";
  }>;
}

interface QualityCareData {
  externalEnvironment: {
    condition: string;
    safety: boolean;
    maintenance: string;
    privacy: boolean;
    homeliness: string;
    comments: string;
  };
  internalEnvironment: {
    condition: string;
    safety: boolean;
    maintenance: string;
    privacy: boolean;
    homeliness: string;
    comments: string;
  };
  overallImpression: {
    condition: string;
    safety: boolean;
    maintenance: string;
    privacy: boolean;
    homeliness: string;
    comments: string;
  };
  generalComments: string;
}

interface EducationData {
  attendanceStatus: string;
  engagementSummary: string;
  educationPlans: Array<{
    id: string;
    name: string;
    checked: boolean;
  }>;
}

interface EnjoymentAchievementData {
  selectedHobbies: string[];
  engagementSupport: string;
  activityLogs: Array<{
    id: string;
    activity: string;
    date: string;
    notes: string;
  }>;
}

interface HealthWellbeingData {
  healthRegistration: boolean;
  services: string[];
  notes: string;
}

interface PositiveRelationshipsData {
  bondingExamples: string;
  conflictResolutionExamples: string;
  concernsRaised: boolean;
}

interface CarePlanningData {
  planProgress: string;
  needsAreas: string[];
  identityComments: string;
  independenceComments: string;
  generalComments: string;
}

interface FollowUpAction {
  id: string;
  description: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  notes: string;
  originalDeadline: string;
  responsiblePerson: string;
}

interface FollowUpData {
  actions: FollowUpAction[];
}

interface LeadershipManagementData {
  managerImpact: string;
  staffStrengthsNeeds: string[];
  improvementAreas: boolean;
}

interface ReportData {
  homeName: string;
  homeAddress: string;
  visitDate: string;
  visitType: "announced" | "unannounced" | "";
  settingType: "registered_childrens_home" | "unregistered_provision" | "";
  formType: "quick" | "";
  sections: ReportSection[];
  actions: Action[];
  recommendationsSummary: string;
  spokeWithChildren: boolean;
  childrenFeedback: ChildFeedback[];
  staffFeedback: StaffFeedback[];
  documentChecklist: DocumentChecklistItem[];
  safeguardingOpinion: boolean | null;
  safeguardingComment: string;
  wellbeingOpinion: boolean | null;
  wellbeingComment: string;
  finalComments: FinalComments;
  qualityCareData: QualityCareData;
  educationData: EducationData;
  enjoymentAchievementData: EnjoymentAchievementData;
  healthWellbeingData: HealthWellbeingData;
  positiveRelationshipsData: PositiveRelationshipsData;
  carePlanningData: CarePlanningData;
  leadershipManagementData: LeadershipManagementData;
  followUpData: FollowUpData;
}

interface ReportVersion {
  id: string;
  timestamp: Date;
  status: "draft" | "submitted";
  data: ReportData;
  description: string;
}

type ViewMode = "create" | "review";
type FormType = "quick";
type FormStep = "selection" | "form";

const REGISTERED_CHILDRENS_HOME_SECTIONS = [
  { id: "quality_care", title: "Quality & Purpose of Care" },
  { id: "voice", title: "Voice of the Child" },
  { id: "environment", title: "Observations of the Environment" },
  { id: "staff", title: "Staff & Management Discussion" },
  { id: "records", title: "Records Reviewed" },
  { id: "follow_up_previous", title: "Follow-Up from Previous Visit" },
  { id: "education", title: "Education (Reg 8)" },
  { id: "enjoyment_achievement", title: "Enjoyment & Achievement (Reg 9)" },
  { id: "health_wellbeing", title: "Health & Wellbeing (Reg 10)" },
  { id: "positive_relationships", title: "Positive Relationships (Reg 11)" },
  { id: "care_planning", title: "Care Planning (Reg 14)" },
  { id: "leadership_management", title: "Leadership & Management (Reg 13)" },
  { id: "compliance", title: "Compliance & Concerns" },
];

const UNREGISTERED_PROVISION_SECTIONS = [
  { id: "quality_care", title: "Quality & Purpose of Care" },
  { id: "welfare_safeguarding", title: "Welfare & Safeguarding" },
  { id: "policies_statement", title: "Policies & Statement of Purpose" },
  { id: "environment_premises", title: "Environment & Premises" },
  { id: "staffing_training", title: "Staffing & Training" },
  { id: "support_young_person", title: "Support for the Young Person" },
  { id: "records_documentation", title: "Records & Documentation" },
  { id: "follow_up_previous", title: "Follow-Up from Previous Visit" },
  { id: "education", title: "Education (Reg 8)" },
  { id: "enjoyment_achievement", title: "Enjoyment & Achievement (Reg 9)" },
  { id: "health_wellbeing", title: "Health & Wellbeing (Reg 10)" },
  { id: "positive_relationships", title: "Positive Relationships (Reg 11)" },
  { id: "care_planning", title: "Care Planning (Reg 14)" },
  { id: "leadership_management", title: "Leadership & Management (Reg 13)" },
  { id: "leadership_oversight", title: "Leadership & Oversight" },
  { id: "ofsted_preparation", title: "Preparation for Ofsted Registration" },
];

const STAFF_ROLES = [
  "Key Worker",
  "Senior",
  "Night Staff",
  "Deputy Manager",
  "Team Leader",
  "Support Worker",
  "Residential Worker",
  "Other",
];

const HOBBY_OPTIONS = [
  "Sports & Physical Activities",
  "Arts & Crafts",
  "Music & Dance",
  "Reading & Writing",
  "Gaming & Technology",
  "Cooking & Baking",
  "Outdoor Activities",
  "Drama & Theatre",
  "Photography & Film",
  "Science & Nature",
  "Board Games & Puzzles",
  "Volunteering & Community Work",
  "Fashion & Beauty",
  "Collecting",
  "Learning Languages",
  "Other",
];

const HEALTH_SERVICES = [
  "GP (General Practitioner)",
  "CAMHS (Child and Adolescent Mental Health Services)",
  "Dentist",
  "Opticians",
];

const CARE_PLANNING_NEEDS_AREAS = [
  "Identity",
  "Independence",
  "Education & Training",
  "Health & Wellbeing",
  "Relationships",
  "Life Skills",
  "Emotional Support",
  "Cultural Needs",
];

const STAFF_STRENGTHS_NEEDS_OPTIONS = [
  "Communication Skills",
  "Safeguarding Knowledge",
  "Behaviour Management",
  "Therapeutic Approaches",
  "Record Keeping",
  "Professional Development",
  "Team Working",
  "Cultural Awareness",
  "Mental Health Support",
  "Educational Support",
  "Life Skills Teaching",
  "Crisis Management",
];

const REGISTERED_HOME_DOCUMENTS = [
  // Child-Focused
  "Care Plan",
  "Placement Plan / Agreement",
  "Risk Assessments",
  "Health / Education Plans",
  "Life Story / Key Work Notes",
  "Contact Arrangements",
  // Daily Practice
  "Daily Logs",
  "Incident / Accident Reports",
  "Complaints / Concerns Log",
  "Sanctions / Rewards Log",
  "Missing from Home Records",
  // Staffing & Records
  "Rota (last 2 weeks min.)",
  "Staff List with Roles",
  "Supervision Records",
  "Training Matrix or Certificates",
  "Recruitment Files (DBS, references)",
  // Management & Oversight
  "Statement of Purpose",
  "Safeguarding Policy",
  "Fire Safety Log",
  "Health & Safety Assessments",
  "Internal Reg 45 Reports (Manager's QA)",
  "Visitors' Log",
  "Notifications to Ofsted (serious incidents etc.)",
];

const UNREGISTERED_SETTING_DOCUMENTS = [
  // Child-Focused
  "Care Plan",
  "Risk Assessments",
  "Placement Agreement (from Local Authority)",
  "Health / Education Overview (if not formal plans)",
  "Evidence of Key Work / Daily Support Notes",
  // Daily Practice
  "Daily Logs / Case Notes",
  "Incident Reports",
  "Complaints / Concerns Record",
  "Informal Sanctions / Behaviour Notes",
  // Staffing & Records
  "Rota (especially night cover)",
  "Staff Details & Roles",
  "Evidence of Basic Training (Safeguarding, First Aid)",
  "DBS Confirmation Letters or Screenshots",
  // Organisational Oversight
  "Statement of Purpose (Draft or Working Version)",
  "Fire Safety Risk Assessment",
  "Evidence of Registration Intent (Ofsted application, payment, draft policies)",
  "Contract / Agreement with LA",
  "Any Internal QA Audits / Self-Assessments",
];

const ReportBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("create");
  const [formStep, setFormStep] = useState<FormStep>("selection");
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [showFormSwitchDialog, setShowFormSwitchDialog] = useState(false);
  const [pendingFormType, setPendingFormType] = useState<FormType | null>(null);
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
  const [isGeneratingAIPolished, setIsGeneratingAIPolished] = useState(false);
  const [aiPolishedContent, setAiPolishedContent] = useState("");
  const [showChildFriendlyPreview, setShowChildFriendlyPreview] =
    useState(false);

  // Offline functionality state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineChanges, setHasOfflineChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  const [reportData, setReportData] = useState<ReportData>({
    homeName: searchParams.get("homeName") || "Sample Children's Home",
    homeAddress:
      searchParams.get("homeAddress") || "123 Oak Street, Manchester",
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "",
    settingType: "",
    formType: "",
    sections: REGISTERED_CHILDRENS_HOME_SECTIONS.map((section) => ({
      id: section.id,
      title: section.title,
      content: "",
      images: [],
      isRecording: false,
    })),
    actions: [],
    recommendationsSummary: "",
    spokeWithChildren: false,
    childrenFeedback: [],
    staffFeedback: [],
    documentChecklist: [],
    safeguardingOpinion: null,
    safeguardingComment: "",
    wellbeingOpinion: null,
    wellbeingComment: "",
    finalComments: {
      safeguardingOpinion: "",
      safeguardingExplanation: "",
      wellbeingOpinion: "",
      wellbeingExplanation: "",
      recommendations: [],
    },
    qualityCareData: {
      externalEnvironment: {
        condition: "",
        safety: false,
        maintenance: "",
        privacy: false,
        homeliness: "",
        comments: "",
      },
      internalEnvironment: {
        condition: "",
        safety: false,
        maintenance: "",
        privacy: false,
        homeliness: "",
        comments: "",
      },
      overallImpression: {
        condition: "",
        safety: false,
        maintenance: "",
        privacy: false,
        homeliness: "",
        comments: "",
      },
      generalComments: "",
    },
    educationData: {
      attendanceStatus: "",
      engagementSummary: "",
      educationPlans: [
        { id: "pep", name: "Personal Education Plan (PEP)", checked: false },
        { id: "ehcp", name: "Education, Health and Care Plan (EHCP)", checked: false },
        { id: "sen_support", name: "SEN Support Plan", checked: false },
        { id: "individual_learning", name: "Individual Learning Plan", checked: false },
        { id: "behaviour_support", name: "Behaviour Support Plan", checked: false },
        { id: "transition_plan", name: "Transition Plan", checked: false },
        { id: "careers_guidance", name: "Careers Guidance Plan", checked: false },
      ],
    },
    enjoymentAchievementData: {
      selectedHobbies: [],
      engagementSupport: "",
      activityLogs: [],
    },
    healthWellbeingData: {
      healthRegistration: false,
      services: [],
      notes: "",
    },
    positiveRelationshipsData: {
      bondingExamples: "",
      conflictResolutionExamples: "",
      concernsRaised: false,
    },
    carePlanningData: {
      planProgress: "",
      needsAreas: [],
      identityComments: "",
      independenceComments: "",
      generalComments: "",
    },
    leadershipManagementData: {
      managerImpact: "",
      staffStrengthsNeeds: [],
      improvementAreas: false,
    },
    followUpData: {
      actions: [],
    },
  });

  // State for form validation and unlocking
  const [settingTypeError, setSettingTypeError] = useState("");
  const [showSettingTypeError, setShowSettingTypeError] = useState(false);
  const [formTypeError, setFormTypeError] = useState("");
  const [showFormTypeError, setShowFormTypeError] = useState(false);
  const isFormUnlocked = reportData.settingType !== "" && reportData.formType !== "";
  const isFormSelectionComplete = reportData.formType !== "";

  // State for follow-up message generator
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [showFollowUpMessage, setShowFollowUpMessage] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");

  // Offline functionality - Connection status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "🟢 Connected",
        description:
          "Internet connection restored. You can now sync your changes.",
        duration: 3000,
      });

      // Check for offline changes and prompt sync
      const homeId = searchParams.get("homeId") || "sample-home";
      const reportId = `report-${homeId}-${new Date().toISOString().split("T")[0]}`;
      const offlineData = localStorage.getItem(`offline-report-${reportId}`);

      if (offlineData && hasOfflineChanges) {
        setShowSyncDialog(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "🔴 Offline",
        description:
          "Changes will be saved locally until connection is restored.",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasOfflineChanges, searchParams, toast]);

  // Load existing actions and offline data for this home
  useEffect(() => {
    const homeId = searchParams.get("homeId") || "sample-home";
    const reportId = `report-${homeId}-${new Date().toISOString().split("T")[0]}`;

    // Load existing actions
    const savedActions = localStorage.getItem(`actions-${homeId}`);
    if (savedActions) {
      const actions: Action[] = JSON.parse(savedActions);
      const incompleteActions = actions.filter(
        (action) => action.status !== "completed",
      );

      // Pre-fill incomplete actions into recommendations section
      if (incompleteActions.length > 0) {
        setReportData((prev) => ({
          ...prev,
          actions: actions,
        }));
      }
    }

    // Load offline report data if exists
    const offlineData = localStorage.getItem(`offline-report-${reportId}`);
    if (offlineData) {
      try {
        const parsedData = JSON.parse(offlineData);
        // Ensure staffFeedback and documentChecklist exist for backward compatibility
        if (!parsedData.reportData.staffFeedback) {
          parsedData.reportData.staffFeedback = [];
        }
        if (!parsedData.reportData.documentChecklist) {
          parsedData.reportData.documentChecklist = [];
        }
        if (!parsedData.reportData.formType || parsedData.reportData.formType === "full") {
          parsedData.reportData.formType = "quick"; // Default to quick form, convert full to quick
        }
        // Ensure quick form fields exist for backward compatibility
        if (parsedData.reportData.safeguardingOpinion === undefined) {
          parsedData.reportData.safeguardingOpinion = null;
        }
        if (!parsedData.reportData.safeguardingComment) {
          parsedData.reportData.safeguardingComment = "";
        }
        if (parsedData.reportData.wellbeingOpinion === undefined) {
          parsedData.reportData.wellbeingOpinion = null;
        }
        if (!parsedData.reportData.wellbeingComment) {
          parsedData.reportData.wellbeingComment = "";
        }
        // Ensure finalComments exists for backward compatibility
        if (!parsedData.reportData.finalComments) {
          parsedData.reportData.finalComments = {
            safeguardingOpinion: "",
            safeguardingExplanation: "",
            wellbeingOpinion: "",
            wellbeingExplanation: "",
            recommendations: [],
          };
        }
        // Ensure qualityCareData exists for backward compatibility
        if (!parsedData.reportData.qualityCareData) {
          parsedData.reportData.qualityCareData = {
            externalEnvironment: {
              condition: "",
              safety: false,
              maintenance: "",
              privacy: false,
              homeliness: "",
              comments: "",
            },
            internalEnvironment: {
              condition: "",
              safety: false,
              maintenance: "",
              privacy: false,
              homeliness: "",
              comments: "",
            },
            overallImpression: {
              condition: "",
              safety: false,
              maintenance: "",
              privacy: false,
              homeliness: "",
              comments: "",
            },
            generalComments: "",
          };
        }
        // Ensure educationData exists for backward compatibility
        if (!parsedData.reportData.educationData) {
          parsedData.reportData.educationData = {
            attendanceStatus: "",
            engagementSummary: "",
            educationPlans: [
              { id: "pep", name: "Personal Education Plan (PEP)", checked: false },
              { id: "ehcp", name: "Education, Health and Care Plan (EHCP)", checked: false },
              { id: "sen_support", name: "SEN Support Plan", checked: false },
              { id: "individual_learning", name: "Individual Learning Plan", checked: false },
              { id: "behaviour_support", name: "Behaviour Support Plan", checked: false },
              { id: "transition_plan", name: "Transition Plan", checked: false },
              { id: "careers_guidance", name: "Careers Guidance Plan", checked: false },
            ],
          };
        }
        // Ensure enjoymentAchievementData exists for backward compatibility
        if (!parsedData.reportData.enjoymentAchievementData) {
          parsedData.reportData.enjoymentAchievementData = {
            selectedHobbies: [],
            engagementSupport: "",
            activityLogs: [],
          };
        }
        // Ensure healthWellbeingData exists for backward compatibility
        if (!parsedData.reportData.healthWellbeingData) {
          parsedData.reportData.healthWellbeingData = {
            healthRegistration: false,
            services: [],
            notes: "",
          };
        }
        // Ensure positiveRelationshipsData exists for backward compatibility
        if (!parsedData.reportData.positiveRelationshipsData) {
          parsedData.reportData.positiveRelationshipsData = {
            bondingExamples: "",
            conflictResolutionExamples: "",
            concernsRaised: false,
          };
        }
        // Ensure carePlanningData exists for backward compatibility
        if (!parsedData.reportData.carePlanningData) {
          parsedData.reportData.carePlanningData = {
            planProgress: "",
            needsAreas: [],
            identityComments: "",
            independenceComments: "",
            generalComments: "",
          };
        }
        // Ensure leadershipManagementData exists for backward compatibility
        if (!parsedData.reportData.leadershipManagementData) {
          parsedData.reportData.leadershipManagementData = {
            managerImpact: "",
            staffStrengthsNeeds: [],
            improvementAreas: false,
          };
        }
        // Ensure followUpData exists for backward compatibility
        if (!parsedData.reportData.followUpData) {
          parsedData.reportData.followUpData = {
            actions: [],
          };
        }
        setReportData(parsedData.reportData);
        setAiGeneratedContent(parsedData.aiGeneratedContent || "");
        setChildFriendlySummary(parsedData.childFriendlySummary || "");
        setHasOfflineChanges(true);
        setLastSaved(new Date(parsedData.lastSaved));
        
        // Set form step based on whether form type is selected
        if (parsedData.reportData.formType) {
          setFormStep("form");
        }

        toast({
          title: "📄 Offline Draft Loaded",
          description: "Your previous offline work has been restored.",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error loading offline data:", error);
      }
    }
  }, [searchParams, toast]);

  // Enhanced auto-save functionality with offline support
  const saveToLocalStorage = useCallback(
    (data: ReportData, isOffline = false) => {
      const homeId = searchParams.get("homeId") || "sample-home";
      const reportId = `report-${homeId}-${new Date().toISOString().split("T")[0]}`;

      const saveData = {
        reportData: data,
        aiGeneratedContent,
        childFriendlySummary,
        lastSaved: new Date().toISOString(),
        isOffline,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(
          `offline-report-${reportId}`,
          JSON.stringify(saveData),
        );
        if (isOffline) {
          setHasOfflineChanges(true);
        }
        return true;
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        toast({
          title: "⚠️ Save Error",
          description:
            "Unable to save locally. Please check your browser storage.",
          variant: "destructive",
        });
        return false;
      }
    },
    [searchParams, aiGeneratedContent, childFriendlySummary, toast],
  );

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (isOnline) {
        handleSaveDraft(true);
      } else {
        // Save offline
        const success = saveToLocalStorage(reportData, true);
        if (success) {
          setLastSaved(new Date());
        }
      }
    }, 15000); // Auto-save every 15 seconds

    return () => clearInterval(autoSave);
  }, [reportData, isOnline, saveToLocalStorage]);

  const handleSaveDraft = (isAutoSave = false) => {
    // Prevent auto-save if form type or setting type is not selected
    if ((!reportData.formType || !reportData.settingType) && isAutoSave) {
      return;
    }

    // Show error if trying to manually save without form type
    if (!reportData.formType && !isAutoSave) {
      setShowFormTypeError(true);
      setFormTypeError("Please select a form type before saving.");
      return;
    }

    // Show error if trying to manually save without setting type
    if (!reportData.settingType && !isAutoSave) {
      setShowSettingTypeError(true);
      setSettingTypeError("Please select a setting type before saving.");
      // Scroll to setting type field
      const settingTypeElement = document.querySelector(
        "[data-setting-type-select]",
      );
      if (settingTypeElement) {
        settingTypeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    if (isOnline) {
      // In a real app, this would save to a backend
      localStorage.setItem("reportDraft", JSON.stringify(reportData));
      setLastSaved(new Date());
      if (!isAutoSave) {
        toast({
          title: "💾 Draft Saved",
          description: "Your report has been saved to the cloud.",
          duration: 2000,
        });
      }
    } else {
      // Save offline
      const success = saveToLocalStorage(reportData, true);
      if (success) {
        setLastSaved(new Date());
        if (!isAutoSave) {
          toast({
            title: "💾 Saved Offline",
            description:
              "Your report has been saved locally and will sync when online.",
            duration: 3000,
          });
        }
      }
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
    
    // Disable autopause to prevent automatic stopping
    if ('webkitSpeechRecognition' in window) {
      recognition.maxAlternatives = 1;
      recognition.serviceURI = '';
    }

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

      // Include children's feedback marked for AI summary
      const childrenFeedbackForAI = reportData.childrenFeedback
        .filter(
          (feedback) => feedback.includeInAISummary && feedback.summary.trim(),
        )
        .map((feedback) => ({
          title: `${terminology.capitalSingular} Feedback (${feedback.initialsOrCode})`,
          content: `${feedback.summary}${feedback.concernsRaised ? " [Concerns were raised]" : ""}${feedback.actionTaken ? ` Action taken: ${feedback.actionTaken}` : ""}`,
        }));

      // Include staff feedback marked for AI summary
      const staffFeedbackForAI = reportData.staffFeedback
        .filter(
          (feedback) =>
            feedback.includeInAISummary &&
            (feedback.questionsAsked.trim() || feedback.keyPointsRaised.trim()),
        )
        .map((feedback) => ({
          title: `Staff Interview - ${feedback.initialsOrCode} (${feedback.role})`,
          content: `${feedback.questionsAsked ? `Questions asked: ${feedback.questionsAsked}\n` : ""}${feedback.keyPointsRaised ? `Key points raised: ${feedback.keyPointsRaised}` : ""}${feedback.concernsRaised ? "\n⚠️ Concerns were raised during this interview." : ""}`,
        }));

      // Include all children's feedback (not just those marked for AI summary) to ensure comprehensive reporting
      const allChildrenFeedback = reportData.childrenFeedback
        .filter((feedback) => feedback.summary.trim())
        .map((feedback) => ({
          title: `${terminology.capitalSingular} Voice - ${feedback.initialsOrCode}${feedback.age ? ` (Age: ${feedback.age})` : ""}`,
          content: `Summary: ${feedback.summary}${feedback.concernsRaised ? "\n⚠️ Concerns were raised during this conversation." : ""}${feedback.actionTaken ? `\nAction taken: ${feedback.actionTaken}` : ""}`,
        }));

      // Combine regular sections with children's feedback (prioritize marked feedback, then include all)
      const combinedChildrenFeedback =
        childrenFeedbackForAI.length > 0
          ? childrenFeedbackForAI
          : allChildrenFeedback;
      const allSections = [
        ...reportSections,
        ...combinedChildrenFeedback,
        ...staffFeedbackForAI,
      ];

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
      const reportTitle =
        reportData.settingType === "unregistered_provision"
          ? "Regulation 44-Style Assurance Review Report"
          : "Regulation 44 Visit Report";
      let aiSummary = `# ${reportTitle}\n\n`;

      // Header Information
      aiSummary += `**Home:** ${reportData.homeName}\n`;
      aiSummary += `**Address:** ${reportData.homeAddress}\n`;
      aiSummary += `**Date of Visit:** ${new Date(reportData.visitDate).toLocaleDateString()}\n`;
      aiSummary += `**Type of Visit:** ${reportData.visitType ? reportData.visitType.charAt(0).toUpperCase() + reportData.visitType.slice(1) : "Not specified"}\n`;
      aiSummary += `**Setting Type:** ${reportData.settingType === "registered_childrens_home" ? "Registered Children's Home" : reportData.settingType === "unregistered_provision" ? "Regulation 44-Style Assurance Review – Unregistered Provision" : "Not specified"}\n\n`;

      // Executive Summary
      aiSummary += `## Executive Summary\n\n`;
      if (reportData.settingType === "unregistered_provision") {
        aiSummary += `This report documents the findings from the Regulation 44-Style Assurance Review conducted at ${reportData.homeName}. `;
        aiSummary += `The ${reportData.visitType || "scheduled"} review assessed the provision's readiness for Ofsted registration and compliance with regulatory standards for the care and support of young people.\n\n`;
      } else {
        aiSummary += `This report documents the findings from the Regulation 44 visit conducted at ${reportData.homeName}. `;
        aiSummary += `The ${reportData.visitType || "scheduled"} visit assessed compliance with regulatory requirements and the quality of care provided to children and young people.\n\n`;
      }

      // Detailed Findings by Section
      if (allSections.length > 0) {
        aiSummary += `## Detailed Findings\n\n`;
        allSections.forEach((section) => {
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
      if (allSections.length > 0) {
        if (reportData.settingType === "unregistered_provision") {
          aiSummary += `Based on the observations and discussions during this assurance review, the following key areas have been identified for attention in preparation for Ofsted registration. `;
          if (childrenFeedbackForAI.length > 0) {
            aiSummary += `The voices of ${terminology.plural} have been captured and their feedback has been incorporated into this assessment. `;
          }
          aiSummary += `The provision demonstrates commitment to meeting regulatory standards, with specific recommendations outlined above to support successful registration and ongoing compliance.\n\n`;
        } else {
          aiSummary += `Based on the observations and discussions during this visit, the following key areas have been identified for attention. `;
          if (childrenFeedbackForAI.length > 0) {
            aiSummary += `The voices of ${terminology.plural} have been captured and their feedback has been incorporated into this assessment. `;
          }
          aiSummary += `The home demonstrates commitment to providing quality care, with specific recommendations outlined above to support continuous improvement.\n\n`;
        }
      } else {
        if (reportData.settingType === "unregistered_provision") {
          aiSummary += `This review focused on specific areas of regulatory compliance and readiness for registration. Detailed observations and recommendations are documented in the actions section above.\n\n`;
        } else {
          aiSummary += `This visit focused on specific areas of concern and compliance. Detailed observations and recommendations are documented in the actions section above.\n\n`;
        }
      }

      // Next Steps
      aiSummary += `## Next Steps\n\n`;
      if (reportData.settingType === "unregistered_provision") {
        aiSummary += `- Implementation of recommendations within specified timeframes\n`;
        aiSummary += `- Follow-up monitoring of action items\n`;
        aiSummary += `- Preparation for Ofsted registration application\n`;
        aiSummary += `- Schedule follow-up assurance review as required\n`;
        aiSummary += `- Ongoing communication with provision manager regarding progress towards registration\n\n`;
      } else {
        aiSummary += `- Implementation of recommendations within specified timeframes\n`;
        aiSummary += `- Follow-up monitoring of action items\n`;
        aiSummary += `- Schedule next regulatory visit as per requirements\n`;
        aiSummary += `- Ongoing communication with registered manager regarding progress\n\n`;
      }

      // Footer
      aiSummary += `---\n\n`;
      aiSummary += `*This report has been generated using AI assistance and should be reviewed for accuracy and completeness before submission.*`;

      setAiGeneratedContent(aiSummary);
      setIsGeneratingAI(false);
    }, 2000);
  };

  const generateAIPolishedReport = async () => {
    setIsGeneratingAIPolished(true);

    // Simulate AI generation for polished report
    setTimeout(() => {
      // Collect content from all report sections
      const reportSections = reportData.sections
        .filter((section) => section.content.trim())
        .map((section) => ({ title: section.title, content: section.content }));

      // Include children's feedback
      const childrenFeedbackContent = reportData.childrenFeedback
        .filter((feedback) => feedback.summary.trim())
        .map((feedback) => ({
          title: `${terminology.capitalSingular} Feedback (${feedback.initialsOrCode})`,
          content: `Summary: ${feedback.summary}${feedback.concernsRaised ? "\n⚠️ Concerns were raised during this conversation." : ""}${feedback.actionTaken ? `\nAction taken: ${feedback.actionTaken}` : ""}`,
        }));

      // Include staff feedback
      const staffFeedbackContent = reportData.staffFeedback
        .filter(
          (feedback) =>
            feedback.questionsAsked.trim() || feedback.keyPointsRaised.trim(),
        )
        .map((feedback) => ({
          title: `Staff Interview - ${feedback.initialsOrCode} (${feedback.role})`,
          content: `${feedback.questionsAsked ? `Questions asked: ${feedback.questionsAsked}\n` : ""}${feedback.keyPointsRaised ? `Key points raised: ${feedback.keyPointsRaised}` : ""}${feedback.concernsRaised ? "\n⚠️ Concerns were raised during this interview." : ""}`,
        }));

      const allSections = [
        ...reportSections,
        ...childrenFeedbackContent,
        ...staffFeedbackContent,
      ];

      // Build the AI-polished report
      const reportTitle =
        reportData.settingType === "unregistered_provision"
          ? "Regulation 44-Style Assurance Review Report"
          : "Regulation 44 Visit Report";
      let polishedReport = `# ${reportTitle}\n\n`;

      // Header Information
      polishedReport += `**Home:** ${reportData.homeName}\n`;
      polishedReport += `**Address:** ${reportData.homeAddress}\n`;
      polishedReport += `**Date of Visit:** ${new Date(reportData.visitDate).toLocaleDateString()}\n`;
      polishedReport += `**Type of Visit:** ${reportData.visitType ? reportData.visitType.charAt(0).toUpperCase() + reportData.visitType.slice(1) : "Not specified"}\n`;
      polishedReport += `**Setting Type:** ${reportData.settingType === "registered_childrens_home" ? "Registered Children's Home" : reportData.settingType === "unregistered_provision" ? "Regulation 44-Style Assurance Review – Unregistered Provision" : "Not specified"}\n\n`;

      // Executive Summary
      polishedReport += `## Executive Summary\n\n`;
      if (reportData.settingType === "unregistered_provision") {
        polishedReport += `This comprehensive assurance review was conducted at ${reportData.homeName} to evaluate the provision's compliance with regulatory standards and readiness for Ofsted registration. The ${reportData.visitType || "scheduled"} review assessed key areas including safeguarding practices, environmental standards, staffing arrangements, and the quality of care provided to young people.\n\n`;
      } else {
        polishedReport += `This Regulation 44 visit was conducted at ${reportData.homeName} to assess compliance with regulatory requirements and evaluate the quality of care provided to children and young people. The ${reportData.visitType || "scheduled"} visit examined key areas of practice and identified opportunities for continued improvement.\n\n`;
      }

      // Polished Findings by Section
      if (allSections.length > 0) {
        polishedReport += `## Key Findings and Observations\n\n`;
        allSections.forEach((section) => {
          polishedReport += `### ${section.title}\n\n`;
          // AI-enhanced version of the content (simulated improvement)
          let enhancedContent = section.content
            .replace(/\b(good|ok|fine)\b/gi, "satisfactory")
            .replace(/\b(bad|poor|not good)\b/gi, "requires improvement")
            .replace(/\b(very good|excellent|great)\b/gi, "exemplary")
            .replace(
              /\b(I saw|I noticed|I observed)\b/gi,
              "During the visit, it was observed that",
            )
            .replace(
              /\b(The staff said|Staff told me)\b/gi,
              "Staff members reported that",
            )
            .replace(/\b(Kids|Children)\b/gi, terminology.plural)
            .replace(/\b(Kid|Child)\b/gi, terminology.singular);

          // Add professional structure
          if (enhancedContent.length > 100) {
            enhancedContent = `The assessment of this area revealed the following key points:\n\n${enhancedContent}\n\nOverall, this aspect of the provision demonstrates ${Math.random() > 0.5 ? "strong practice with opportunities for continued development" : "areas of strength alongside specific recommendations for enhancement"}.`;
          }

          polishedReport += `${enhancedContent}\n\n`;
        });
      }

      // Recommendations Summary
      if (reportData.recommendationsSummary.trim()) {
        polishedReport += `## Summary of Recommendations\n\n`;
        let enhancedRecommendations = reportData.recommendationsSummary
          .replace(
            /\b(should|need to|must)\b/gi,
            "it is recommended that the provision",
          )
          .replace(/\b(fix|sort out)\b/gi, "address")
          .replace(/\b(make sure|ensure)\b/gi, "ensure that");
        polishedReport += `${enhancedRecommendations}\n\n`;
      }

      // Actions and Recommendations
      if (reportData.actions.length > 0) {
        polishedReport += `## Specific Actions and Recommendations\n\n`;
        polishedReport += `The following actions have been identified to support continued improvement and regulatory compliance:\n\n`;
        reportData.actions.forEach((action, index) => {
          polishedReport += `**${index + 1}.** ${action.description}\n`;
          polishedReport += `   - **Responsible Person:** ${action.responsiblePerson}\n`;
          polishedReport += `   - **Target Completion:** ${new Date(action.deadline).toLocaleDateString()}\n`;
          polishedReport += `   - **Current Status:** ${action.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`;
        });
      }

      // Overall Assessment
      polishedReport += `## Overall Assessment and Conclusion\n\n`;
      if (reportData.settingType === "unregistered_provision") {
        polishedReport += `This assurance review demonstrates the provision's commitment to achieving regulatory compliance and providing quality care for young people. The recommendations outlined above will support the setting in its preparation for Ofsted registration and ongoing development of best practice.\n\n`;
      } else {
        polishedReport += `This visit confirms the home's dedication to providing quality care and maintaining regulatory standards. The recommendations identified will support continued improvement and ensure the best possible outcomes for children and young people.\n\n`;
      }

      polishedReport += `The next review will monitor progress against these recommendations and assess ongoing compliance with regulatory requirements.\n\n`;

      // Footer
      polishedReport += `---\n\n`;
      polishedReport += `*This report has been professionally enhanced using AI assistance to improve clarity and structure while maintaining the accuracy of all observations and findings.*`;

      setAiPolishedContent(polishedReport);
      setIsGeneratingAIPolished(false);
    }, 3000);
  };

  const generateChildFriendlySummary = async () => {
    setIsGeneratingChildFriendly(true);

    // Simulate AI generation for child-friendly summary
    setTimeout(() => {
      const summarySection = reportData.sections.find(
        (s) => s.id === "quality_care",
      );
      const voiceSection = reportData.sections.find((s) => s.id === "voice");
      const environmentSection = reportData.sections.find(
        (s) => s.id === "environment",
      );

      const childFriendlyTitle =
        reportData.settingType === "unregistered_provision"
          ? `What We Found During Our Assurance Review at ${reportData.homeName}`
          : `What We Found During Our Visit to ${reportData.homeName}`;
      let childFriendlyText = `# ${childFriendlyTitle}\n\n`;

      const visitDescription =
        reportData.settingType === "unregistered_provision"
          ? `Hi everyone! We conducted an assurance review at your home on ${new Date(reportData.visitDate).toLocaleDateString()} to see how things are going and to help prepare for official registration.`
          : `Hi everyone! We visited your home on ${new Date(reportData.visitDate).toLocaleDateString()} to see how things are going and to make sure you're getting the best care possible.`;
      childFriendlyText += `${visitDescription}\n\n`;

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
    // Prevent submission if form type is not selected
    if (!reportData.formType) {
      setShowFormTypeError(true);
      setFormTypeError(
        "Please select a form type before submitting the report.",
      );
      return;
    }

    // Prevent submission if setting type is not selected
    if (!reportData.settingType) {
      setShowSettingTypeError(true);
      setSettingTypeError(
        "Please select a setting type before submitting the report.",
      );
      // Scroll to setting type field
      const settingTypeElement = document.querySelector(
        "[data-setting-type-select]",
      );
      if (settingTypeElement) {
        settingTypeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

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

  const handleAddChildFeedback = () => {
    const newFeedback: ChildFeedback = {
      id: Date.now().toString(),
      initialsOrCode: "",
      age: "",
      summary: "",
      concernsRaised: false,
      actionTaken: "",
      includeInAISummary: false,
    };

    setReportData((prev) => ({
      ...prev,
      childrenFeedback: [...prev.childrenFeedback, newFeedback],
    }));
  };

  const handleUpdateChildFeedback = (
    feedbackId: string,
    field: keyof ChildFeedback,
    value: string | boolean,
  ) => {
    setReportData((prev) => ({
      ...prev,
      childrenFeedback: prev.childrenFeedback.map((feedback) =>
        feedback.id === feedbackId ? { ...feedback, [field]: value } : feedback,
      ),
    }));
  };

  const handleRemoveChildFeedback = (feedbackId: string) => {
    setReportData((prev) => ({
      ...prev,
      childrenFeedback: prev.childrenFeedback.filter(
        (feedback) => feedback.id !== feedbackId,
      ),
    }));
  };

  const handleAddStaffFeedback = () => {
    const newFeedback: StaffFeedback = {
      id: Date.now().toString(),
      initialsOrCode: "",
      role: "",
      questionsAsked: "",
      keyPointsRaised: "",
      concernsRaised: false,
      includeInAISummary: false,
    };

    setReportData((prev) => ({
      ...prev,
      staffFeedback: [...prev.staffFeedback, newFeedback],
    }));
  };

  const handleUpdateStaffFeedback = (
    feedbackId: string,
    field: keyof StaffFeedback,
    value: string | boolean,
  ) => {
    setReportData((prev) => ({
      ...prev,
      staffFeedback: prev.staffFeedback.map((feedback) =>
        feedback.id === feedbackId ? { ...feedback, [field]: value } : feedback,
      ),
    }));
  };

  const handleRemoveStaffFeedback = (feedbackId: string) => {
    setReportData((prev) => ({
      ...prev,
      staffFeedback: prev.staffFeedback.filter(
        (feedback) => feedback.id !== feedbackId,
      ),
    }));
  };

  // Determine terminology based on setting type
  const getChildTerminology = () => {
    if (reportData.settingType === "unregistered_provision") {
      return {
        singular: "young person",
        plural: "young people",
        capitalSingular: "Young Person",
        capitalPlural: "Young People",
      };
    }
    return {
      singular: "child",
      plural: "children",
      capitalSingular: "Child",
      capitalPlural: "Children",
    };
  };

  const terminology = getChildTerminology();

  // Helper function to get form type display name
  const getFormTypeDisplayName = (formType: FormType) => {
    switch (formType) {
      case "quick":
        return "Report Form";
      default:
        return "Report Form";
    }
  };

  // Handle setting type change and update sections accordingly
  const handleSettingTypeChange = (
    settingType: "registered_childrens_home" | "unregistered_provision",
  ) => {
    const newSections =
      settingType === "registered_childrens_home"
        ? REGISTERED_CHILDRENS_HOME_SECTIONS
        : UNREGISTERED_PROVISION_SECTIONS;

    // Preserve existing content where sections match
    const updatedSections = newSections.map((newSection) => {
      const existingSection = reportData.sections.find(
        (s) => s.id === newSection.id,
      );
      return {
        id: newSection.id,
        title: newSection.title,
        content: existingSection?.content || "",
        images: existingSection?.images || [],
        isRecording: false,
      };
    });

    // Generate document checklist based on setting type
    const documentList =
      settingType === "registered_childrens_home"
        ? REGISTERED_HOME_DOCUMENTS
        : UNREGISTERED_SETTING_DOCUMENTS;

    const newDocumentChecklist: DocumentChecklistItem[] = documentList.map(
      (doc, index) => ({
        id: `doc-${index}`,
        name: doc,
        checked: false,
        notes: "",
      }),
    );

    setReportData((prev) => ({
      ...prev,
      settingType,
      sections: updatedSections,
      documentChecklist: newDocumentChecklist,
    }));

    // Clear any setting type errors
    setShowSettingTypeError(false);
    setSettingTypeError("");
    
    // Clear any form type errors
    setShowFormTypeError(false);
    setFormTypeError("");

    // Auto-scroll to the next section after selection
    setTimeout(() => {
      const nextSection = document.querySelector("[data-next-section]");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  const handleDocumentChecklistUpdate = (
    itemId: string,
    field: "checked" | "notes",
    value: boolean | string,
  ) => {
    setReportData((prev) => ({
      ...prev,
      documentChecklist: prev.documentChecklist.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleAddCustomDocument = () => {
    if (!newDocumentName.trim()) {
      toast({
        title: "Document Name Required",
        description: "Please enter a document name before adding.",
        variant: "destructive",
      });
      return;
    }

    const newDocument: DocumentChecklistItem = {
      id: `custom-${Date.now()}`,
      name: newDocumentName.trim(),
      checked: false,
      notes: "",
    };

    setReportData((prev) => ({
      ...prev,
      documentChecklist: [...prev.documentChecklist, newDocument],
    }));

    setNewDocumentName("");
    toast({
      title: "Document Added",
      description: `"${newDocumentName.trim()}" has been added to the checklist.`,
      duration: 2000,
    });
  };

  const handleRemoveCustomDocument = (itemId: string) => {
    setReportData((prev) => ({
      ...prev,
      documentChecklist: prev.documentChecklist.filter(
        (item) => item.id !== itemId,
      ),
    }));
  };

  const generateFollowUpMessage = () => {
    const uncheckedDocuments = reportData.documentChecklist.filter(
      (item) => !item.checked,
    );

    if (uncheckedDocuments.length === 0) {
      toast({
        title: "No Missing Documents",
        description:
          "All documents have been reviewed. No follow-up message needed.",
        duration: 3000,
      });
      return;
    }

    // Calculate suggested date (7 days from visit date)
    const visitDate = new Date(reportData.visitDate);
    const suggestedDate = new Date(visitDate);
    suggestedDate.setDate(visitDate.getDate() + 7);

    const documentList = uncheckedDocuments
      .map((doc) => `• ${doc.name}`)
      .join("\n");

    const message = `Subject: Follow-up from Regulation 44 Visit – Request for Documents

Dear [Manager's Name],

Thank you again for your time during my visit to ${reportData.homeName} on ${new Date(reportData.visitDate).toLocaleDateString()}.

As part of my post-visit process, I am following up to request the following documents that were not available on the day of my visit:

${documentList}

If these could be shared by ${suggestedDate.toLocaleDateString()}, that would be appreciated.

Please do not hesitate to contact me if anything needs clarification.

Kind regards,
[IP Name]`;

    setFollowUpMessage(message);
    setShowFollowUpMessage(true);
  };

  const copyFollowUpMessage = () => {
    navigator.clipboard.writeText(followUpMessage);
    toast({
      title: "Message Copied",
      description: "Follow-up message has been copied to clipboard.",
      duration: 2000,
    });
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

  const handleDownloadAIPolishedPDF = () => {
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
      const timestamp = `AI-Enhanced report generated on ${now.toLocaleDateString("en-GB")} at ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

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
    const reportTitle =
      reportData.settingType === "unregistered_provision"
        ? "AI-Enhanced Regulation 44-Style Assurance Review Report"
        : "AI-Enhanced Regulation 44 Visit Report";
    pdf.text(reportTitle, margin, yPosition);
    yPosition += 15;

    // Add the AI-polished content
    const content = aiPolishedContent
      .replace(/^# /, "")
      .replace(/\n## /g, "\n\n")
      .replace(/\n\n/g, "\n");
    addWrappedText(content, 11);

    // Add footer to last page
    addFooter();

    // Download the PDF
    const fileName = `AI_Enhanced_Report_${reportData.homeName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
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
    const childFriendlyTitle =
      reportData.settingType === "unregistered_provision"
        ? "What We Found During Our Assurance Review"
        : "Child-Friendly Visit Summary";
    pdf.text(childFriendlyTitle, margin, yPosition);
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
    const reportTitle =
      reportData.settingType === "unregistered_provision"
        ? "Regulation 44-Style Assurance Review Report"
        : "Regulation 44 Visit Report";
    pdf.text(reportTitle, margin, yPosition);
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

  // Sync offline data to cloud
  const syncOfflineData = async () => {
    setIsSyncing(true);

    try {
      const homeId = searchParams.get("homeId") || "sample-home";
      const reportId = `report-${homeId}-${new Date().toISOString().split("T")[0]}`;
      const offlineData = localStorage.getItem(`offline-report-${reportId}`);

      if (offlineData) {
        const parsedData = JSON.parse(offlineData);

        // In a real app, this would sync to backend
        localStorage.setItem(
          "reportDraft",
          JSON.stringify(parsedData.reportData),
        );

        // Clear offline data after successful sync
        localStorage.removeItem(`offline-report-${reportId}`);
        setHasOfflineChanges(false);

        toast({
          title: "☁️ Sync Complete",
          description: "Your offline changes have been synced to the cloud.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "⚠️ Sync Failed",
        description: "Unable to sync offline changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setShowSyncDialog(false);
    }
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

    if (isOnline) {
      localStorage.setItem("reportDraft", JSON.stringify(reportData));
    } else {
      saveToLocalStorage(reportData, true);
    }

    return newVersion;
  };

  // Handle form type selection
  const handleFormTypeSelection = (formType: FormType) => {
    setReportData((prev) => ({
      ...prev,
      formType,
    }));
    setFormStep("form");
    setShowFormTypeError(false);
    setFormTypeError("");
  };



  // Render form type selection screen
  const renderFormTypeSelection = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Card className="bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">
            Report Builder
          </CardTitle>
          <CardDescription className="text-base">
            Ready to begin your visit report?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Quick Form Option */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 ${
                reportData.formType === "quick" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => handleFormTypeSelection("quick")}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    reportData.formType === "quick" 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300"
                  }`}>
                    {reportData.formType === "quick" && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Report Form
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Comprehensive report format with structured sections for detailed observations and findings.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge variant="secondary">Standard Format</Badge>
                    <span>•</span>
                    <span>Structured sections</span>
                    <span>•</span>
                    <span>Complete documentation</span>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Good to know:</p>
                <p>
                  This is the standard report format that includes all necessary sections for comprehensive documentation of your visit.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {showFormTypeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800 font-medium">{formTypeError}</p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => {
                if (!reportData.formType) {
                  setShowFormTypeError(true);
                  setFormTypeError("Please select a form type to continue.");
                  return;
                }
                setFormStep("form");
              }}
              className="px-8 py-2"
              disabled={!reportData.formType}
            >
Continue with Report Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Report Review Header */}
      <Card className="mb-8 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            {reportData.settingType === "unregistered_provision"
              ? "Assurance Review Report"
              : "Report Review"}{" "}
            - {reportData.homeName}
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
                  Visit Type *
                </Label>
                <Select
                  value={reportData.visitType}
                  onValueChange={(value: "announced" | "unannounced") =>
                    setReportData((prev) => ({
                      ...prev,
                      visitType: value,
                    }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announced">Announced</SelectItem>
                    <SelectItem value="unannounced">Unannounced</SelectItem>
                  </SelectContent>
                </Select>
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

            {reportData.documentChecklist.length > 0 && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  Document Review Summary
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 bg-purple-50 p-3 rounded">
                    <p className="font-medium mb-2">
                      Documents Reviewed:{" "}
                      {
                        reportData.documentChecklist.filter(
                          (item) => item.checked,
                        ).length
                      }{" "}
                      of {reportData.documentChecklist.length}
                    </p>
                    <div className="space-y-1">
                      {reportData.documentChecklist
                        .filter((item) => item.checked)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center text-xs"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            <span>{item.name}</span>
                            {item.notes && (
                              <span className="ml-2 text-gray-600">
                                - {item.notes}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    {reportData.documentChecklist.some(
                      (item) => !item.checked,
                    ) && (
                      <div className="mt-3 pt-2 border-t border-purple-200">
                        <p className="font-medium text-red-600 mb-1">
                          Documents Not Reviewed:
                        </p>
                        <div className="space-y-1">
                          {reportData.documentChecklist
                            .filter((item) => !item.checked)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center text-xs text-red-600"
                              >
                                <AlertCircle className="h-3 w-3 mr-2" />
                                <span>{item.name}</span>
                                {item.notes && (
                                  <span className="ml-2 text-gray-600">
                                    - {item.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
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

            {reportData.childrenFeedback.length > 0 && (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  {terminology.capitalPlural}'s Feedback
                </h3>
                <div className="space-y-3">
                  {reportData.childrenFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="text-sm text-gray-700 bg-green-50 p-3 rounded"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {feedback.initialsOrCode}
                          {feedback.age && ` (Age: ${feedback.age})`}
                        </p>
                        {feedback.includeInAISummary && (
                          <Badge variant="secondary" className="text-xs">
                            Included in AI Summary
                          </Badge>
                        )}
                      </div>
                      <p className="mb-2">{feedback.summary}</p>
                      {feedback.concernsRaised && (
                        <p className="text-red-600 font-medium mb-1">
                          ⚠️ Concerns were raised
                        </p>
                      )}
                      {feedback.actionTaken && (
                        <p className="text-blue-600">
                          <strong>Action taken:</strong> {feedback.actionTaken}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData.staffFeedback.length > 0 && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">
                  Staff Feedback / Interviews
                </h3>
                <div className="space-y-3">
                  {reportData.staffFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="text-sm text-gray-700 bg-blue-50 p-3 rounded"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {feedback.initialsOrCode} ({feedback.role})
                        </p>
                        {feedback.includeInAISummary && (
                          <Badge variant="secondary" className="text-xs">
                            Included in AI Summary
                          </Badge>
                        )}
                      </div>
                      {feedback.questionsAsked && (
                        <div className="mb-2">
                          <p className="font-medium text-blue-800">
                            Questions asked:
                          </p>
                          <p>{feedback.questionsAsked}</p>
                        </div>
                      )}
                      {feedback.keyPointsRaised && (
                        <div className="mb-2">
                          <p className="font-medium text-blue-800">
                            Key points raised:
                          </p>
                          <p>{feedback.keyPointsRaised}</p>
                        </div>
                      )}
                      {feedback.concernsRaised && (
                        <p className="text-red-600 font-medium mb-1">
                          ⚠️ Concerns were raised
                        </p>
                      )}
                    </div>
                  ))}
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
          {/* Connection Status Indicator */}
          <div className="flex items-center justify-center mb-3">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isOnline
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <WifiOff className="h-4 w-4" />
                  <span>Offline – changes will be saved locally</span>
                </>
              )}
              {hasOfflineChanges && isOnline && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSyncDialog(true)}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Sync Available
                </Button>
              )}
            </div>
          </div>

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
                  {reportData.settingType === "unregistered_provision"
                    ? "Regulation 44-Style Assurance Review"
                    : "Regulation 44 Report"}{" "}
                  – {reportData.homeName}
                  {reportData.formType && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getFormTypeDisplayName(reportData.formType)}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-gray-500">
                  Visit Date:{" "}
                  {new Date(reportData.visitDate).toLocaleDateString()} |
                  Status: {isReportSubmitted ? "Submitted" : "Draft"}
                  {lastSaved && viewMode === "create" && (
                    <span className="ml-2">
                      • Last saved: {lastSaved.toLocaleTimeString()}
                      {!isOnline && hasOfflineChanges && (
                        <span className="ml-1 text-orange-600 font-medium">
                          (Offline)
                        </span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Cloud className="h-5 w-5 mr-2" />
              Sync Offline Changes
            </DialogTitle>
            <DialogDescription>
              You have offline changes that can now be synced to the cloud.
              Would you like to upload your local draft?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What will be synced:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All report sections and content</li>
                    <li>Actions and recommendations</li>
                    <li>Children's feedback</li>
                    <li>AI-generated summaries</li>
                    <li>Uploaded images and attachments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={syncOfflineData}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSyncDialog(false)}
                disabled={isSyncing}
              >
                Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {viewMode === "review" && renderReviewScreen()}

      {viewMode === "create" && formStep === "selection" && renderFormTypeSelection()}

      {viewMode === "create" && formStep === "form" && (
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

              <div data-setting-type-select>
                <Label className="text-sm font-medium text-gray-600">
                  What type of setting are you visiting? *
                </Label>
                <Select
                  value={reportData.settingType}
                  onValueChange={(
                    value:
                      | "registered_childrens_home"
                      | "unregistered_provision",
                  ) => handleSettingTypeChange(value)}
                >
                  <SelectTrigger
                    className={`mt-2 ${showSettingTypeError && !reportData.settingType ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select setting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registered_childrens_home">
                      Registered Children's Home
                    </SelectItem>
                    <SelectItem value="unregistered_provision">
                      Regulation 44-Style Assurance Review – Unregistered
                      Provision
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!reportData.settingType && (
                  <p
                    className={`text-sm mt-2 ${showSettingTypeError ? "text-red-600" : "text-gray-500"}`}
                  >
                    {showSettingTypeError
                      ? settingTypeError
                      : "Please select a setting type to begin completing this report."}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Visit Type *
                </Label>
                <Select
                  value={reportData.visitType}
                  onValueChange={(value: "announced" | "unannounced") =>
                    setReportData((prev) => ({
                      ...prev,
                      visitType: value,
                    }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announced">Announced</SelectItem>
                    <SelectItem value="unannounced">Unannounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Checklist */}
          <div data-next-section>
            <Card
              className={`mb-8 bg-white relative ${!isFormUnlocked ? "opacity-50" : ""}`}
            >
              {!isFormUnlocked && (
                <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center z-10">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-md border text-sm text-gray-600">
                    Select a setting type above to unlock this section
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Document Checklist
                </CardTitle>
                <CardDescription>
                  Review and check off documents that were examined during your
                  visit. Add notes for any missing or concerning documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {reportData.documentChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`doc-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            handleDocumentChecklistUpdate(
                              item.id,
                              "checked",
                              !!checked,
                            )
                          }
                        />
                        <Label
                          htmlFor={`doc-${item.id}`}
                          className="text-sm font-medium flex-1 cursor-pointer"
                        >
                          {item.name}
                        </Label>
                        {item.checked && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {reportData.documentChecklist.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Progress Summary
                          </p>
                          <p className="text-xs text-gray-600">
                            {
                              reportData.documentChecklist.filter(
                                (item) => item.checked,
                              ).length
                            }{" "}
                            of {reportData.documentChecklist.length} documents
                            reviewed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(
                              (reportData.documentChecklist.filter(
                                (item) => item.checked,
                              ).length /
                                reportData.documentChecklist.length) *
                                100,
                            )}
                            %
                          </div>
                          <p className="text-xs text-gray-600">Complete</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate Follow-Up Message to Manager */}
                  {reportData.documentChecklist.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">
                            Generate Follow-Up Message to Manager
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Create a follow-up email for any documents that were
                            not available during your visit.
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={generateFollowUpMessage}
                            variant="outline"
                            className="flex-1"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Generate Follow-Up Message
                          </Button>
                          <div className="text-sm text-gray-500">
                            {
                              reportData.documentChecklist.filter(
                                (item) => !item.checked,
                              ).length
                            }{" "}
                            missing document
                            {reportData.documentChecklist.filter(
                              (item) => !item.checked,
                            ).length !== 1
                              ? "s"
                              : ""}
                          </div>
                        </div>

                        {showFollowUpMessage && followUpMessage && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="follow-up-message">
                                Follow-Up Message (Editable)
                              </Label>
                              <Textarea
                                id="follow-up-message"
                                value={followUpMessage}
                                onChange={(e) =>
                                  setFollowUpMessage(e.target.value)
                                }
                                className="mt-1 min-h-[200px] font-mono text-sm"
                                placeholder="Follow-up message will appear here..."
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={copyFollowUpMessage}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                              <Button
                                onClick={generateFollowUpMessage}
                                variant="outline"
                                size="sm"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                              </Button>
                              <Button
                                onClick={() => setShowFollowUpMessage(false)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Close
                              </Button>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                  <p className="font-medium mb-1">
                                    Follow-Up Message Generated
                                  </p>
                                  <p>
                                    The message above includes all missing
                                    documents and suggests a follow-up date 7
                                    days from your visit. You can edit the
                                    message before copying or sending.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Sections */}
          <Card
            className={`mb-8 bg-white relative ${!isFormUnlocked ? "opacity-50" : ""}`}
          >
            {!isFormUnlocked && (
              <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border text-sm text-gray-600">
                  Select a setting type above to unlock this section
                </div>
              </div>
            )}
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
                      {section.id === "quality_care" ? (
                        /* Quality & Purpose of Care Section */
                        <div className="space-y-8">
                          {/* External Environment */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              External Environment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="ext-condition">Condition</Label>
                                <Select
                                  value={reportData.qualityCareData.externalEnvironment.condition}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        externalEnvironment: {
                                          ...prev.qualityCareData.externalEnvironment,
                                          condition: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="ext-maintenance">Maintenance</Label>
                                <Select
                                  value={reportData.qualityCareData.externalEnvironment.maintenance}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        externalEnvironment: {
                                          ...prev.qualityCareData.externalEnvironment,
                                          maintenance: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select maintenance level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="ext-homeliness">Homeliness</Label>
                                <Select
                                  value={reportData.qualityCareData.externalEnvironment.homeliness}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        externalEnvironment: {
                                          ...prev.qualityCareData.externalEnvironment,
                                          homeliness: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select homeliness level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="ext-safety">Safety Standards Met</Label>
                                  <Switch
                                    id="ext-safety"
                                    checked={reportData.qualityCareData.externalEnvironment.safety}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          externalEnvironment: {
                                            ...prev.qualityCareData.externalEnvironment,
                                            safety: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="ext-privacy">Privacy Respected</Label>
                                  <Switch
                                    id="ext-privacy"
                                    checked={reportData.qualityCareData.externalEnvironment.privacy}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          externalEnvironment: {
                                            ...prev.qualityCareData.externalEnvironment,
                                            privacy: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="ext-comments">Additional Comments (Optional)</Label>
                              <Textarea
                                id="ext-comments"
                                value={reportData.qualityCareData.externalEnvironment.comments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    qualityCareData: {
                                      ...prev.qualityCareData,
                                      externalEnvironment: {
                                        ...prev.qualityCareData.externalEnvironment,
                                        comments: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder="Any specific observations about the external environment..."
                                className="mt-1 min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* Internal Environment */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              Internal Environment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="int-condition">Condition</Label>
                                <Select
                                  value={reportData.qualityCareData.internalEnvironment.condition}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        internalEnvironment: {
                                          ...prev.qualityCareData.internalEnvironment,
                                          condition: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="int-maintenance">Maintenance</Label>
                                <Select
                                  value={reportData.qualityCareData.internalEnvironment.maintenance}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        internalEnvironment: {
                                          ...prev.qualityCareData.internalEnvironment,
                                          maintenance: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select maintenance level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="int-homeliness">Homeliness</Label>
                                <Select
                                  value={reportData.qualityCareData.internalEnvironment.homeliness}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        internalEnvironment: {
                                          ...prev.qualityCareData.internalEnvironment,
                                          homeliness: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select homeliness level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="int-safety">Safety Standards Met</Label>
                                  <Switch
                                    id="int-safety"
                                    checked={reportData.qualityCareData.internalEnvironment.safety}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          internalEnvironment: {
                                            ...prev.qualityCareData.internalEnvironment,
                                            safety: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="int-privacy">Privacy Respected</Label>
                                  <Switch
                                    id="int-privacy"
                                    checked={reportData.qualityCareData.internalEnvironment.privacy}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          internalEnvironment: {
                                            ...prev.qualityCareData.internalEnvironment,
                                            privacy: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="int-comments">Additional Comments (Optional)</Label>
                              <Textarea
                                id="int-comments"
                                value={reportData.qualityCareData.internalEnvironment.comments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    qualityCareData: {
                                      ...prev.qualityCareData,
                                      internalEnvironment: {
                                        ...prev.qualityCareData.internalEnvironment,
                                        comments: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder="Any specific observations about the internal environment..."
                                className="mt-1 min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* Overall Impression */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              Overall Impression
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="overall-condition">Condition</Label>
                                <Select
                                  value={reportData.qualityCareData.overallImpression.condition}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        overallImpression: {
                                          ...prev.qualityCareData.overallImpression,
                                          condition: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="overall-maintenance">Maintenance</Label>
                                <Select
                                  value={reportData.qualityCareData.overallImpression.maintenance}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        overallImpression: {
                                          ...prev.qualityCareData.overallImpression,
                                          maintenance: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select maintenance level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="overall-homeliness">Homeliness</Label>
                                <Select
                                  value={reportData.qualityCareData.overallImpression.homeliness}
                                  onValueChange={(value) =>
                                    setReportData((prev) => ({
                                      ...prev,
                                      qualityCareData: {
                                        ...prev.qualityCareData,
                                        overallImpression: {
                                          ...prev.qualityCareData.overallImpression,
                                          homeliness: value,
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select homeliness level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                                    <SelectItem value="requires-improvement">Requires Improvement</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="overall-safety">Safety Standards Met</Label>
                                  <Switch
                                    id="overall-safety"
                                    checked={reportData.qualityCareData.overallImpression.safety}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          overallImpression: {
                                            ...prev.qualityCareData.overallImpression,
                                            safety: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="overall-privacy">Privacy Respected</Label>
                                  <Switch
                                    id="overall-privacy"
                                    checked={reportData.qualityCareData.overallImpression.privacy}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        qualityCareData: {
                                          ...prev.qualityCareData,
                                          overallImpression: {
                                            ...prev.qualityCareData.overallImpression,
                                            privacy: checked,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="overall-comments">Additional Comments (Optional)</Label>
                              <Textarea
                                id="overall-comments"
                                value={reportData.qualityCareData.overallImpression.comments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    qualityCareData: {
                                      ...prev.qualityCareData,
                                      overallImpression: {
                                        ...prev.qualityCareData.overallImpression,
                                        comments: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder="Any specific observations about the overall impression..."
                                className="mt-1 min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* General Comments */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              General Comments
                            </h4>
                            <div>
                              <Label htmlFor="general-comments">Overall Assessment (Optional)</Label>
                              <Textarea
                                id="general-comments"
                                value={reportData.qualityCareData.generalComments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    qualityCareData: {
                                      ...prev.qualityCareData,
                                      generalComments: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Provide an overall assessment of the quality and purpose of care at this setting..."
                                className="mt-1 min-h-[120px]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : section.id === "recommendations" ? (
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
                      ) : section.id === "education" ? (
                        /* Education (Reg 8) Section */
                        <div className="space-y-6">
                          {/* Attendance Status Dropdown */}
                          <div>
                            <Label htmlFor="attendance-status">Attendance Status</Label>
                            <Select
                              value={reportData.educationData.attendanceStatus}
                              onValueChange={(value) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  educationData: {
                                    ...prev.educationData,
                                    attendanceStatus: value,
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select attendance status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent (95%+)</SelectItem>
                                <SelectItem value="good">Good (90-94%)</SelectItem>
                                <SelectItem value="satisfactory">Satisfactory (85-89%)</SelectItem>
                                <SelectItem value="requires-improvement">Requires Improvement (80-84%)</SelectItem>
                                <SelectItem value="poor">Poor (Below 80%)</SelectItem>
                                <SelectItem value="not-in-education">Not Currently in Education</SelectItem>
                                <SelectItem value="home-educated">Home Educated</SelectItem>
                                <SelectItem value="alternative-provision">Alternative Provision</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Engagement Summary Text Box */}
                          <div>
                            <Label htmlFor="engagement-summary">Engagement Summary</Label>
                            <Textarea
                              id="engagement-summary"
                              value={reportData.educationData.engagementSummary}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  educationData: {
                                    ...prev.educationData,
                                    engagementSummary: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Describe the young person's engagement with education, any challenges, achievements, and support being provided..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Education Plans Checklist */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Education Plans in Place
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {reportData.educationData.educationPlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`education-plan-${plan.id}`}
                                    checked={plan.checked}
                                    onCheckedChange={(checked) =>
                                      setReportData((prev) => ({
                                        ...prev,
                                        educationData: {
                                          ...prev.educationData,
                                          educationPlans: prev.educationData.educationPlans.map((p) =>
                                            p.id === plan.id ? { ...p, checked: !!checked } : p
                                          ),
                                        },
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor={`education-plan-${plan.id}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {plan.name}
                                  </Label>
                                  {plan.checked && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about education provision, school relationships, or educational outcomes..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "enjoyment_achievement" ? (
                        /* Enjoyment & Achievement (Reg 9) Section */
                        <div className="space-y-6">
                          {/* Multi-select Hobbies */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Hobbies & Interests
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Select all hobbies and interests that the young people engage in or have expressed interest in.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {HOBBY_OPTIONS.map((hobby) => (
                                <div
                                  key={hobby}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`hobby-${hobby.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={reportData.enjoymentAchievementData.selectedHobbies.includes(hobby)}
                                    onCheckedChange={(checked) => {
                                      setReportData((prev) => ({
                                        ...prev,
                                        enjoymentAchievementData: {
                                          ...prev.enjoymentAchievementData,
                                          selectedHobbies: checked
                                            ? [...prev.enjoymentAchievementData.selectedHobbies, hobby]
                                            : prev.enjoymentAchievementData.selectedHobbies.filter(h => h !== hobby),
                                        },
                                      }));
                                    }}
                                  />
                                  <Label
                                    htmlFor={`hobby-${hobby.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {hobby}
                                  </Label>
                                  {reportData.enjoymentAchievementData.selectedHobbies.includes(hobby) && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {reportData.enjoymentAchievementData.selectedHobbies.length > 0 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  Selected Hobbies ({reportData.enjoymentAchievementData.selectedHobbies.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {reportData.enjoymentAchievementData.selectedHobbies.map((hobby) => (
                                    <Badge key={hobby} variant="secondary" className="text-xs">
                                      {hobby}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Engagement Support Text Area */}
                          <div>
                            <Label htmlFor="engagement-support">Engagement Support</Label>
                            <Textarea
                              id="engagement-support"
                              value={reportData.enjoymentAchievementData.engagementSupport}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  enjoymentAchievementData: {
                                    ...prev.enjoymentAchievementData,
                                    engagementSupport: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Describe how staff support young people to engage in enjoyable activities, pursue their interests, and achieve their goals..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Activity Logs - Repeatable Entries */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Activity Logs
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Record specific activities, achievements, or notable moments related to enjoyment and achievement.
                            </p>
                            
                            {reportData.enjoymentAchievementData.activityLogs.length > 0 && (
                              <div className="space-y-4 mb-6">
                                {reportData.enjoymentAchievementData.activityLogs.map((log, index) => (
                                  <div
                                    key={log.id}
                                    className="border rounded-lg p-4 space-y-4 bg-blue-50"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-lg">
                                        Activity Log {index + 1}
                                      </h4>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setReportData((prev) => ({
                                            ...prev,
                                            enjoymentAchievementData: {
                                              ...prev.enjoymentAchievementData,
                                              activityLogs: prev.enjoymentAchievementData.activityLogs.filter(
                                                (l) => l.id !== log.id
                                              ),
                                            },
                                          }));
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor={`activity-${log.id}`}>
                                          Activity/Achievement *
                                        </Label>
                                        <Input
                                          id={`activity-${log.id}`}
                                          value={log.activity}
                                          onChange={(e) => {
                                            setReportData((prev) => ({
                                              ...prev,
                                              enjoymentAchievementData: {
                                                ...prev.enjoymentAchievementData,
                                                activityLogs: prev.enjoymentAchievementData.activityLogs.map((l) =>
                                                  l.id === log.id ? { ...l, activity: e.target.value } : l
                                                ),
                                              },
                                            }));
                                          }}
                                          placeholder="e.g., Won football match, Completed art project"
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`date-${log.id}`}>
                                          Date
                                        </Label>
                                        <Input
                                          id={`date-${log.id}`}
                                          type="date"
                                          value={log.date}
                                          onChange={(e) => {
                                            setReportData((prev) => ({
                                              ...prev,
                                              enjoymentAchievementData: {
                                                ...prev.enjoymentAchievementData,
                                                activityLogs: prev.enjoymentAchievementData.activityLogs.map((l) =>
                                                  l.id === log.id ? { ...l, date: e.target.value } : l
                                                ),
                                              },
                                            }));
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor={`notes-${log.id}`}>
                                        Notes & Observations
                                      </Label>
                                      <Textarea
                                        id={`notes-${log.id}`}
                                        value={log.notes}
                                        onChange={(e) => {
                                          setReportData((prev) => ({
                                            ...prev,
                                            enjoymentAchievementData: {
                                              ...prev.enjoymentAchievementData,
                                              activityLogs: prev.enjoymentAchievementData.activityLogs.map((l) =>
                                                l.id === log.id ? { ...l, notes: e.target.value } : l
                                              ),
                                            },
                                          }));
                                        }}
                                        placeholder="Describe the activity, the young person's engagement, any achievements or challenges..."
                                        className="mt-1 min-h-[80px]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <Button
                              onClick={() => {
                                const newLog = {
                                  id: Date.now().toString(),
                                  activity: "",
                                  date: new Date().toISOString().split('T')[0],
                                  notes: "",
                                };
                                setReportData((prev) => ({
                                  ...prev,
                                  enjoymentAchievementData: {
                                    ...prev.enjoymentAchievementData,
                                    activityLogs: [...prev.enjoymentAchievementData.activityLogs, newLog],
                                  },
                                }));
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Activity Log Entry
                            </Button>
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about enjoyment, achievement, or recreational activities..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "health_wellbeing" ? (
                        /* Health & Wellbeing (Reg 10) Section */
                        <div className="space-y-6">
                          {/* Health Registration Toggle */}
                          <div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="health-registration" className="text-base font-medium">
                                Health Registration
                              </Label>
                              <Switch
                                id="health-registration"
                                checked={reportData.healthWellbeingData.healthRegistration}
                                onCheckedChange={(checked) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    healthWellbeingData: {
                                      ...prev.healthWellbeingData,
                                      healthRegistration: checked,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Is the young person registered with appropriate health services?
                            </p>
                          </div>

                          {/* Multi-select Services */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Health Services
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Select all health services that the young person is registered with or has access to.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {HEALTH_SERVICES.map((service) => (
                                <div
                                  key={service}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`service-${service.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={reportData.healthWellbeingData.services.includes(service)}
                                    onCheckedChange={(checked) => {
                                      setReportData((prev) => ({
                                        ...prev,
                                        healthWellbeingData: {
                                          ...prev.healthWellbeingData,
                                          services: checked
                                            ? [...prev.healthWellbeingData.services, service]
                                            : prev.healthWellbeingData.services.filter(s => s !== service),
                                        },
                                      }));
                                    }}
                                  />
                                  <Label
                                    htmlFor={`service-${service.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {service}
                                  </Label>
                                  {reportData.healthWellbeingData.services.includes(service) && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {reportData.healthWellbeingData.services.length > 0 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  Selected Services ({reportData.healthWellbeingData.services.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {reportData.healthWellbeingData.services.map((service) => (
                                    <Badge key={service} variant="secondary" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Optional Notes */}
                          <div>
                            <Label htmlFor="health-notes">Additional Notes (Optional)</Label>
                            <Textarea
                              id="health-notes"
                              value={reportData.healthWellbeingData.notes}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  healthWellbeingData: {
                                    ...prev.healthWellbeingData,
                                    notes: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Any additional observations about health and wellbeing provision, appointments, medication management, or health-related concerns..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Additional Notes from Section Content */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              General Health & Wellbeing Observations (Optional)
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
                              placeholder="Record any general observations about the young person's health and wellbeing, including physical health, mental health support, and overall wellness..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "positive_relationships" ? (
                        /* Positive Relationships (Reg 11) Section */
                        <div className="space-y-6">
                          {/* Bonding Examples */}
                          <div>
                            <Label htmlFor="bonding-examples">Examples of Bonding</Label>
                            <Textarea
                              id="bonding-examples"
                              value={reportData.positiveRelationshipsData.bondingExamples}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  positiveRelationshipsData: {
                                    ...prev.positiveRelationshipsData,
                                    bondingExamples: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Describe examples of positive bonding between young people and staff, or between young people themselves. Include specific observations of trust, attachment, and meaningful relationships..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Conflict Resolution Examples */}
                          <div>
                            <Label htmlFor="conflict-resolution-examples">Examples of Conflict Resolution</Label>
                            <Textarea
                              id="conflict-resolution-examples"
                              value={reportData.positiveRelationshipsData.conflictResolutionExamples}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  positiveRelationshipsData: {
                                    ...prev.positiveRelationshipsData,
                                    conflictResolutionExamples: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Describe how conflicts are resolved in the home. Include examples of mediation, problem-solving approaches, and how young people are supported to resolve disagreements..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Concerns Toggle */}
                          <div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="relationships-concerns" className="text-base font-medium">
                                Concerns About Relationships
                              </Label>
                              <Switch
                                id="relationships-concerns"
                                checked={reportData.positiveRelationshipsData.concernsRaised}
                                onCheckedChange={(checked) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    positiveRelationshipsData: {
                                      ...prev.positiveRelationshipsData,
                                      concernsRaised: checked,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Toggle this on if you have concerns about relationships in the home that need to be addressed.
                            </p>
                            {reportData.positiveRelationshipsData.concernsRaised && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-red-800">
                                    <p className="font-medium mb-1">Concerns Identified</p>
                                    <p>
                                      Please ensure that specific concerns about relationships are documented in the examples above or in the additional notes section below.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about relationships in the home, including peer relationships, staff-young person relationships, or family contact arrangements..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "care_planning" ? (
                        /* Care Planning (Reg 14) Section */
                        <div className="space-y-6">
                          {/* Plan Progress Dropdown */}
                          <div>
                            <Label htmlFor="plan-progress">Care Plan Progress</Label>
                            <Select
                              value={reportData.carePlanningData.planProgress}
                              onValueChange={(value) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  carePlanningData: {
                                    ...prev.carePlanningData,
                                    planProgress: value,
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select care plan progress" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent - All objectives being met</SelectItem>
                                <SelectItem value="good">Good - Most objectives being met</SelectItem>
                                <SelectItem value="satisfactory">Satisfactory - Some objectives being met</SelectItem>
                                <SelectItem value="requires-improvement">Requires Improvement - Few objectives being met</SelectItem>
                                <SelectItem value="poor">Poor - Objectives not being met</SelectItem>
                                <SelectItem value="not-applicable">Not Applicable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Multi-select Needs Areas */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Needs Areas Being Addressed
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Select all areas where the young person's needs are being actively addressed in their care plan.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {CARE_PLANNING_NEEDS_AREAS.map((area) => (
                                <div
                                  key={area}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`needs-area-${area.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={reportData.carePlanningData.needsAreas.includes(area)}
                                    onCheckedChange={(checked) => {
                                      setReportData((prev) => ({
                                        ...prev,
                                        carePlanningData: {
                                          ...prev.carePlanningData,
                                          needsAreas: checked
                                            ? [...prev.carePlanningData.needsAreas, area]
                                            : prev.carePlanningData.needsAreas.filter(n => n !== area),
                                        },
                                      }));
                                    }}
                                  />
                                  <Label
                                    htmlFor={`needs-area-${area.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {area}
                                  </Label>
                                  {reportData.carePlanningData.needsAreas.includes(area) && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {reportData.carePlanningData.needsAreas.length > 0 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  Selected Areas ({reportData.carePlanningData.needsAreas.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {reportData.carePlanningData.needsAreas.map((area) => (
                                    <Badge key={area} variant="secondary" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Conditional Comment Boxes */}
                          {reportData.carePlanningData.needsAreas.includes("Identity") && (
                            <div>
                              <Label htmlFor="identity-comments">Identity Development Comments</Label>
                              <Textarea
                                id="identity-comments"
                                value={reportData.carePlanningData.identityComments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    carePlanningData: {
                                      ...prev.carePlanningData,
                                      identityComments: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Describe how the young person's identity development needs are being addressed, including cultural identity, personal values, and sense of self..."
                                className="mt-1 min-h-[100px]"
                              />
                            </div>
                          )}

                          {reportData.carePlanningData.needsAreas.includes("Independence") && (
                            <div>
                              <Label htmlFor="independence-comments">Independence Development Comments</Label>
                              <Textarea
                                id="independence-comments"
                                value={reportData.carePlanningData.independenceComments}
                                onChange={(e) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    carePlanningData: {
                                      ...prev.carePlanningData,
                                      independenceComments: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Describe how the young person's independence skills are being developed, including life skills, decision-making, and preparation for adulthood..."
                                className="mt-1 min-h-[100px]"
                              />
                            </div>
                          )}

                          {/* General Comments */}
                          <div>
                            <Label htmlFor="care-planning-general-comments">General Care Planning Comments</Label>
                            <Textarea
                              id="care-planning-general-comments"
                              value={reportData.carePlanningData.generalComments}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  carePlanningData: {
                                    ...prev.carePlanningData,
                                    generalComments: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Provide general observations about care planning, including the quality of plans, review processes, young person involvement, and overall effectiveness..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about care planning processes, documentation, or outcomes..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "follow_up_previous" ? (
                        /* Follow-Up from Previous Visit Section - Enhanced */
                        <div className="space-y-6">
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Follow-Up Actions from Previous Visit
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Load and track the progress of actions and recommendations from your previous visit. Edit existing actions and add new ones as needed.
                            </p>
                            
                            {/* Load Previous Actions Button */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-blue-900 mb-2">
                                    Load Previous Actions
                                  </h4>
                                  <p className="text-sm text-blue-800 mb-3">
                                    Actions from previous visits for this home are automatically loaded. You can edit their status and add progress notes.
                                  </p>
                                  <Button
                                    onClick={() => {
                                      const homeId = searchParams.get("homeId") || "sample-home";
                                      const savedActions = localStorage.getItem(`actions-${homeId}`);
                                      if (savedActions) {
                                        const actions: Action[] = JSON.parse(savedActions);
                                        const followUpActions: FollowUpAction[] = actions.map(action => ({
                                          id: `followup-${action.id}`,
                                          description: action.description,
                                          status: action.status === "completed" ? "completed" : action.status === "in-progress" ? "in-progress" : "not-started",
                                          notes: action.progressUpdate || "",
                                          originalDeadline: action.deadline,
                                          responsiblePerson: action.responsiblePerson,
                                        }));
                                        setReportData((prev) => ({
                                          ...prev,
                                          followUpData: {
                                            ...prev.followUpData,
                                            actions: [...prev.followUpData.actions, ...followUpActions.filter(fa => 
                                              !prev.followUpData.actions.some(existing => existing.description === fa.description)
                                            )],
                                          },
                                        }));
                                        toast({
                                          title: "Previous Actions Loaded",
                                          description: `${followUpActions.length} actions loaded from previous visits.`,
                                          duration: 3000,
                                        });
                                      } else {
                                        toast({
                                          title: "No Previous Actions Found",
                                          description: "No previous actions found for this home.",
                                          duration: 3000,
                                        });
                                      }
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Load Previous Actions
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Existing Follow-Up Actions */}
                            {reportData.followUpData.actions.length > 0 && (
                              <div className="space-y-4 mb-6">
                                <h4 className="font-medium text-lg border-b pb-2">
                                  Previous Actions ({reportData.followUpData.actions.length})
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[30%]">Action Description</TableHead>
                                        <TableHead className="w-[15%]">Responsible Person</TableHead>
                                        <TableHead className="w-[12%]">Original Deadline</TableHead>
                                        <TableHead className="w-[12%]">Status</TableHead>
                                        <TableHead className="w-[25%]">Progress Notes</TableHead>
                                        <TableHead className="w-[6%]">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {reportData.followUpData.actions.map((action) => (
                                        <TableRow key={action.id}>
                                          <TableCell>
                                            <Textarea
                                              value={action.description}
                                              onChange={(e) => {
                                                setReportData((prev) => ({
                                                  ...prev,
                                                  followUpData: {
                                                    ...prev.followUpData,
                                                    actions: prev.followUpData.actions.map((a) =>
                                                      a.id === action.id ? { ...a, description: e.target.value } : a
                                                    ),
                                                  },
                                                }));
                                              }}
                                              placeholder="Action description..."
                                              className="min-h-[60px] resize-none"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              value={action.responsiblePerson}
                                              onChange={(e) => {
                                                setReportData((prev) => ({
                                                  ...prev,
                                                  followUpData: {
                                                    ...prev.followUpData,
                                                    actions: prev.followUpData.actions.map((a) =>
                                                      a.id === action.id ? { ...a, responsiblePerson: e.target.value } : a
                                                    ),
                                                  },
                                                }));
                                              }}
                                              placeholder="Responsible person..."
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="date"
                                              value={action.originalDeadline}
                                              onChange={(e) => {
                                                setReportData((prev) => ({
                                                  ...prev,
                                                  followUpData: {
                                                    ...prev.followUpData,
                                                    actions: prev.followUpData.actions.map((a) =>
                                                      a.id === action.id ? { ...a, originalDeadline: e.target.value } : a
                                                    ),
                                                  },
                                                }));
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Select
                                              value={action.status}
                                              onValueChange={(value: "not-started" | "in-progress" | "completed" | "delayed") => {
                                                setReportData((prev) => ({
                                                  ...prev,
                                                  followUpData: {
                                                    ...prev.followUpData,
                                                    actions: prev.followUpData.actions.map((a) =>
                                                      a.id === action.id ? { ...a, status: value } : a
                                                    ),
                                                  },
                                                }));
                                              }}
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
                                                <SelectItem value="delayed">
                                                  <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                                    Delayed
                                                  </div>
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </TableCell>
                                          <TableCell>
                                            <Textarea
                                              value={action.notes}
                                              onChange={(e) => {
                                                setReportData((prev) => ({
                                                  ...prev,
                                                  followUpData: {
                                                    ...prev.followUpData,
                                                    actions: prev.followUpData.actions.map((a) =>
                                                      a.id === action.id ? { ...a, notes: e.target.value } : a
                                                    ),
                                                  },
                                                }));
                                              }}
                                              placeholder="Progress notes..."
                                              className="min-h-[60px] resize-none"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-col space-y-2">
                                              <Button
                                                onClick={() => {
                                                  // Save this specific action's progress
                                                  const homeId = searchParams.get("homeId") || "sample-home";
                                                  const existingActions = localStorage.getItem(`actions-${homeId}`);
                                                  if (existingActions) {
                                                    const actions: Action[] = JSON.parse(existingActions);
                                                    const updatedActions = actions.map(a => {
                                                      if (a.description === action.description) {
                                                        return {
                                                          ...a,
                                                          status: action.status as Action["status"],
                                                          progressUpdate: action.notes,
                                                        };
                                                      }
                                                      return a;
                                                    });
                                                    localStorage.setItem(`actions-${homeId}`, JSON.stringify(updatedActions));
                                                  }
                                                  toast({
                                                    title: "Action Updated",
                                                    description: "Progress has been saved for this action.",
                                                    duration: 2000,
                                                  });
                                                }}
                                                variant="outline"
                                                size="sm"
                                              >
                                                <Save className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setReportData((prev) => ({
                                                    ...prev,
                                                    followUpData: {
                                                      ...prev.followUpData,
                                                      actions: prev.followUpData.actions.filter(
                                                        (a) => a.id !== action.id
                                                      ),
                                                    },
                                                  }));
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Add New Action Section */}
                            <div className="border-t pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-lg">
                                  Add New Follow-Up Action
                                </h4>
                                <Button
                                  onClick={() => {
                                    // Save all current follow-up progress before adding new action
                                    const homeId = searchParams.get("homeId") || "sample-home";
                                    const existingActions = localStorage.getItem(`actions-${homeId}`);
                                    if (existingActions) {
                                      const actions: Action[] = JSON.parse(existingActions);
                                      const updatedActions = actions.map(a => {
                                        const followUpAction = reportData.followUpData.actions.find(fa => fa.description === a.description);
                                        if (followUpAction) {
                                          return {
                                            ...a,
                                            status: followUpAction.status as Action["status"],
                                            progressUpdate: followUpAction.notes,
                                          };
                                        }
                                        return a;
                                      });
                                      localStorage.setItem(`actions-${homeId}`, JSON.stringify(updatedActions));
                                    }
                                    toast({
                                      title: "Progress Saved",
                                      description: "All follow-up progress has been saved.",
                                      duration: 2000,
                                    });
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save All Progress
                                </Button>
                              </div>
                              
                              <Button
                                onClick={() => {
                                  const newAction: FollowUpAction = {
                                    id: Date.now().toString(),
                                    description: "",
                                    status: "not-started",
                                    notes: "",
                                    originalDeadline: "",
                                    responsiblePerson: "",
                                  };
                                  setReportData((prev) => ({
                                    ...prev,
                                    followUpData: {
                                      ...prev.followUpData,
                                      actions: [...prev.followUpData.actions, newAction],
                                    },
                                  }));
                                }}
                                variant="outline"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Follow-Up Action
                              </Button>
                            </div>
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about follow-up actions or progress from the previous visit..."
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                        </div>
                      ) : section.id === "leadership_management" ? (
                        /* Leadership & Management (Reg 13) Section */
                        <div className="space-y-6">
                          {/* Manager Impact Text Input */}
                          <div>
                            <Label htmlFor="manager-impact">Manager Impact</Label>
                            <Textarea
                              id="manager-impact"
                              value={reportData.leadershipManagementData.managerImpact}
                              onChange={(e) =>
                                setReportData((prev) => ({
                                  ...prev,
                                  leadershipManagementData: {
                                    ...prev.leadershipManagementData,
                                    managerImpact: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Describe the impact of the manager's leadership on the home, including their vision, approach to staff development, and influence on the quality of care..."
                              className="mt-1 min-h-[120px]"
                            />
                          </div>

                          {/* Multi-select Staff Strengths/Needs */}
                          <div>
                            <Label className="text-base font-medium mb-4 block">
                              Staff Strengths & Development Needs
                            </Label>
                            <p className="text-sm text-gray-600 mb-4">
                              Select all areas where staff demonstrate strengths or have development needs.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {STAFF_STRENGTHS_NEEDS_OPTIONS.map((option) => (
                                <div
                                  key={option}
                                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={`staff-option-${option.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={reportData.leadershipManagementData.staffStrengthsNeeds.includes(option)}
                                    onCheckedChange={(checked) => {
                                      setReportData((prev) => ({
                                        ...prev,
                                        leadershipManagementData: {
                                          ...prev.leadershipManagementData,
                                          staffStrengthsNeeds: checked
                                            ? [...prev.leadershipManagementData.staffStrengthsNeeds, option]
                                            : prev.leadershipManagementData.staffStrengthsNeeds.filter(s => s !== option),
                                        },
                                      }));
                                    }}
                                  />
                                  <Label
                                    htmlFor={`staff-option-${option.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {option}
                                  </Label>
                                  {reportData.leadershipManagementData.staffStrengthsNeeds.includes(option) && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {reportData.leadershipManagementData.staffStrengthsNeeds.length > 0 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  Selected Areas ({reportData.leadershipManagementData.staffStrengthsNeeds.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {reportData.leadershipManagementData.staffStrengthsNeeds.map((option) => (
                                    <Badge key={option} variant="secondary" className="text-xs">
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Improvement Areas Toggle */}
                          <div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="improvement-areas" className="text-base font-medium">
                                Improvement Areas Identified
                              </Label>
                              <Switch
                                id="improvement-areas"
                                checked={reportData.leadershipManagementData.improvementAreas}
                                onCheckedChange={(checked) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    leadershipManagementData: {
                                      ...prev.leadershipManagementData,
                                      improvementAreas: checked,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Toggle this on if specific improvement areas have been identified for leadership and management.
                            </p>
                            {reportData.leadershipManagementData.improvementAreas && (
                              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-orange-800">
                                    <p className="font-medium mb-1">Improvement Areas Identified</p>
                                    <p>
                                      Please ensure that specific improvement areas are documented in the manager impact section above or in the additional notes section below.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Notes */}
                          <div>
                            <Label htmlFor={`content-${section.id}`}>
                              Additional Notes (Optional)
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
                              placeholder="Any additional observations about leadership and management, including governance, oversight, staff supervision, or management systems..."
                              className="mt-1 min-h-[100px]"
                            />
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

                          {/* Staff Feedback Section - Only show in Staff & Management Discussion section */}
                          {section.id === "staff" && (
                            <div className="mt-8 pt-6 border-t">
                              <div className="space-y-6">
                                <div>
                                  <Label className="text-base font-medium">
                                    Staff Feedback / Interviews
                                  </Label>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Record structured interviews with staff
                                    members to capture their views and concerns.
                                  </p>
                                </div>

                                {reportData.staffFeedback.length > 0 && (
                                  <div className="space-y-6">
                                    {reportData.staffFeedback.map(
                                      (feedback, index) => (
                                        <div
                                          key={feedback.id}
                                          className="border rounded-lg p-4 space-y-4 bg-blue-50"
                                        >
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-lg">
                                              Staff Interview {index + 1}
                                            </h4>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveStaffFeedback(
                                                  feedback.id,
                                                )
                                              }
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <X className="h-4 w-4 mr-1" />
                                              Remove
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <Label
                                                htmlFor={`staff-initials-${feedback.id}`}
                                              >
                                                Staff Initials or Code Name *
                                              </Label>
                                              <Input
                                                id={`staff-initials-${feedback.id}`}
                                                value={feedback.initialsOrCode}
                                                onChange={(e) =>
                                                  handleUpdateStaffFeedback(
                                                    feedback.id,
                                                    "initialsOrCode",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="e.g., J.S. or Staff1"
                                                className="mt-1"
                                              />
                                            </div>
                                            <div>
                                              <Label
                                                htmlFor={`staff-role-${feedback.id}`}
                                              >
                                                Role *
                                              </Label>
                                              <Select
                                                value={feedback.role}
                                                onValueChange={(value) =>
                                                  handleUpdateStaffFeedback(
                                                    feedback.id,
                                                    "role",
                                                    value,
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="mt-1">
                                                  <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {STAFF_ROLES.map((role) => (
                                                    <SelectItem
                                                      key={role}
                                                      value={role}
                                                    >
                                                      {role}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>

                                          <div>
                                            <Label
                                              htmlFor={`questions-${feedback.id}`}
                                            >
                                              Questions Asked
                                            </Label>
                                            <Textarea
                                              id={`questions-${feedback.id}`}
                                              value={feedback.questionsAsked}
                                              onChange={(e) =>
                                                handleUpdateStaffFeedback(
                                                  feedback.id,
                                                  "questionsAsked",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Record the questions you asked during the interview..."
                                              className="mt-1 min-h-[80px]"
                                            />
                                          </div>

                                          <div>
                                            <Label
                                              htmlFor={`key-points-${feedback.id}`}
                                            >
                                              Key Points Raised *
                                            </Label>
                                            <Textarea
                                              id={`key-points-${feedback.id}`}
                                              value={feedback.keyPointsRaised}
                                              onChange={(e) =>
                                                handleUpdateStaffFeedback(
                                                  feedback.id,
                                                  "keyPointsRaised",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Record the key points, concerns, or feedback shared by the staff member..."
                                              className="mt-1 min-h-[100px]"
                                            />
                                          </div>

                                          <div>
                                            <Label className="text-base font-medium">
                                              Any concerns raised?
                                            </Label>
                                            <div className="flex items-center space-x-6 mt-2">
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`staff-concerns-yes-${feedback.id}`}
                                                  checked={
                                                    feedback.concernsRaised
                                                  }
                                                  onCheckedChange={(checked) =>
                                                    handleUpdateStaffFeedback(
                                                      feedback.id,
                                                      "concernsRaised",
                                                      !!checked,
                                                    )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={`staff-concerns-yes-${feedback.id}`}
                                                >
                                                  Yes
                                                </Label>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`staff-concerns-no-${feedback.id}`}
                                                  checked={
                                                    !feedback.concernsRaised
                                                  }
                                                  onCheckedChange={(checked) =>
                                                    handleUpdateStaffFeedback(
                                                      feedback.id,
                                                      "concernsRaised",
                                                      !checked,
                                                    )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={`staff-concerns-no-${feedback.id}`}
                                                >
                                                  No
                                                </Label>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center space-x-2 pt-2 border-t">
                                            <Checkbox
                                              id={`staff-include-ai-${feedback.id}`}
                                              checked={
                                                feedback.includeInAISummary
                                              }
                                              onCheckedChange={(checked) =>
                                                handleUpdateStaffFeedback(
                                                  feedback.id,
                                                  "includeInAISummary",
                                                  !!checked,
                                                )
                                              }
                                            />
                                            <Label
                                              htmlFor={`staff-include-ai-${feedback.id}`}
                                              className="text-sm"
                                            >
                                              Include this interview in the
                                              AI-generated summary
                                            </Label>
                                          </div>
                                        </div>
                                      ),
                                    )}

                                    <Button
                                      onClick={handleAddStaffFeedback}
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Another Staff Interview
                                    </Button>
                                  </div>
                                )}

                                {reportData.staffFeedback.length === 0 && (
                                  <Button
                                    onClick={handleAddStaffFeedback}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Staff Interview
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Children's Feedback Section - Only show in Voice of the Child section or Support for the Young Person section */}
                          {(section.id === "voice" ||
                            section.id === "support_young_person") && (
                            <div className="mt-8 pt-6 border-t">
                              <div className="space-y-6">
                                <div>
                                  <Label className="text-base font-medium">
                                    Did you speak with any {terminology.plural}?
                                  </Label>
                                  <div className="flex items-center space-x-6 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="spoke-with-children-yes"
                                        checked={reportData.spokeWithChildren}
                                        onCheckedChange={(checked) => {
                                          setReportData((prev) => ({
                                            ...prev,
                                            spokeWithChildren: !!checked,
                                            childrenFeedback: checked
                                              ? prev.childrenFeedback
                                              : [],
                                          }));
                                        }}
                                      />
                                      <Label htmlFor="spoke-with-children-yes">
                                        Yes
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="spoke-with-children-no"
                                        checked={!reportData.spokeWithChildren}
                                        onCheckedChange={(checked) => {
                                          setReportData((prev) => ({
                                            ...prev,
                                            spokeWithChildren: !checked,
                                            childrenFeedback: checked
                                              ? []
                                              : prev.childrenFeedback,
                                          }));
                                        }}
                                      />
                                      <Label htmlFor="spoke-with-children-no">
                                        No
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                {reportData.spokeWithChildren && (
                                  <div className="space-y-6">
                                    {reportData.childrenFeedback.map(
                                      (feedback, index) => (
                                        <div
                                          key={feedback.id}
                                          className="border rounded-lg p-4 space-y-4 bg-gray-50"
                                        >
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-lg">
                                              {terminology.capitalSingular}{" "}
                                              {index + 1}
                                            </h4>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveChildFeedback(
                                                  feedback.id,
                                                )
                                              }
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <X className="h-4 w-4 mr-1" />
                                              Remove
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <Label
                                                htmlFor={`initials-${feedback.id}`}
                                              >
                                                {terminology.capitalSingular}{" "}
                                                Initials or Code Name *
                                              </Label>
                                              <Input
                                                id={`initials-${feedback.id}`}
                                                value={feedback.initialsOrCode}
                                                onChange={(e) =>
                                                  handleUpdateChildFeedback(
                                                    feedback.id,
                                                    "initialsOrCode",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="e.g., A.B. or Child1"
                                                className="mt-1"
                                              />
                                            </div>
                                            <div>
                                              <Label
                                                htmlFor={`age-${feedback.id}`}
                                              >
                                                Age (optional)
                                              </Label>
                                              <Input
                                                id={`age-${feedback.id}`}
                                                value={feedback.age}
                                                onChange={(e) =>
                                                  handleUpdateChildFeedback(
                                                    feedback.id,
                                                    "age",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="e.g., 14"
                                                className="mt-1"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <Label
                                              htmlFor={`summary-${feedback.id}`}
                                            >
                                              Summary of what they shared *
                                            </Label>
                                            <Textarea
                                              id={`summary-${feedback.id}`}
                                              value={feedback.summary}
                                              onChange={(e) =>
                                                handleUpdateChildFeedback(
                                                  feedback.id,
                                                  "summary",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder={`Record the ${terminology.singular}'s views, feelings, and feedback about their experience...`}
                                              className="mt-1 min-h-[100px]"
                                            />
                                          </div>

                                          <div>
                                            <Label className="text-base font-medium">
                                              Any concerns raised?
                                            </Label>
                                            <div className="flex items-center space-x-6 mt-2">
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`concerns-yes-${feedback.id}`}
                                                  checked={
                                                    feedback.concernsRaised
                                                  }
                                                  onCheckedChange={(checked) =>
                                                    handleUpdateChildFeedback(
                                                      feedback.id,
                                                      "concernsRaised",
                                                      !!checked,
                                                    )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={`concerns-yes-${feedback.id}`}
                                                >
                                                  Yes
                                                </Label>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`concerns-no-${feedback.id}`}
                                                  checked={
                                                    !feedback.concernsRaised
                                                  }
                                                  onCheckedChange={(checked) =>
                                                    handleUpdateChildFeedback(
                                                      feedback.id,
                                                      "concernsRaised",
                                                      !checked,
                                                    )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={`concerns-no-${feedback.id}`}
                                                >
                                                  No
                                                </Label>
                                              </div>
                                            </div>
                                          </div>

                                          <div>
                                            <Label
                                              htmlFor={`action-${feedback.id}`}
                                            >
                                              Action taken or follow-up
                                              (optional)
                                            </Label>
                                            <Textarea
                                              id={`action-${feedback.id}`}
                                              value={feedback.actionTaken}
                                              onChange={(e) =>
                                                handleUpdateChildFeedback(
                                                  feedback.id,
                                                  "actionTaken",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Describe any immediate actions taken or follow-up planned..."
                                              className="mt-1 min-h-[80px]"
                                            />
                                          </div>

                                          <div className="flex items-center space-x-2 pt-2 border-t">
                                            <Checkbox
                                              id={`include-ai-${feedback.id}`}
                                              checked={
                                                feedback.includeInAISummary
                                              }
                                              onCheckedChange={(checked) =>
                                                handleUpdateChildFeedback(
                                                  feedback.id,
                                                  "includeInAISummary",
                                                  !!checked,
                                                )
                                              }
                                            />
                                            <Label
                                              htmlFor={`include-ai-${feedback.id}`}
                                              className="text-sm"
                                            >
                                              Include this feedback in the
                                              AI-generated summary
                                            </Label>
                                          </div>
                                        </div>
                                      ),
                                    )}

                                    <Button
                                      onClick={handleAddChildFeedback}
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Another {terminology.capitalSingular}
                                    </Button>
                                  </div>
                                )}
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

          {/* Independent Person's Final Comments Section */}
          <Card
            className={`mb-8 bg-white relative ${!isFormUnlocked ? "opacity-50" : ""}`}
          >
            {!isFormUnlocked && (
              <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border text-sm text-gray-600">
                  Select a setting type above to unlock this section
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Independent Person's Final Comments
              </CardTitle>
              <CardDescription>
                Complete the legally required elements for Regulation 44.4. These responses will be included in the structured PDF export.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Safeguarding Opinion */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Are children effectively safeguarded? *
                  </Label>
                  <div className="flex items-center space-x-6 mt-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="safeguarding-yes"
                        name="safeguarding-opinion"
                        value="yes"
                        checked={reportData.finalComments.safeguardingOpinion === "yes"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              safeguardingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="safeguarding-yes" className="text-sm font-medium">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="safeguarding-no"
                        name="safeguarding-opinion"
                        value="no"
                        checked={reportData.finalComments.safeguardingOpinion === "no"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              safeguardingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="safeguarding-no" className="text-sm font-medium">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="safeguarding-not-sure"
                        name="safeguarding-opinion"
                        value="not-sure"
                        checked={reportData.finalComments.safeguardingOpinion === "not-sure"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              safeguardingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="safeguarding-not-sure" className="text-sm font-medium">
                        Not sure
                      </Label>
                    </div>
                  </div>
                </div>
                
                {(reportData.finalComments.safeguardingOpinion === "no" || reportData.finalComments.safeguardingOpinion === "not-sure") && (
                  <div>
                    <Label htmlFor="safeguarding-explanation" className="text-sm font-medium">
                      Brief explanation (required) *
                    </Label>
                    <Textarea
                      id="safeguarding-explanation"
                      value={reportData.finalComments.safeguardingExplanation}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          finalComments: {
                            ...prev.finalComments,
                            safeguardingExplanation: e.target.value,
                          },
                        }))
                      }
                      placeholder="Please explain your concerns or uncertainties about safeguarding..."
                      className="mt-2 min-h-[80px]"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Wellbeing Opinion */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Does the home promote children's wellbeing? *
                  </Label>
                  <div className="flex items-center space-x-6 mt-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="wellbeing-yes"
                        name="wellbeing-opinion"
                        value="yes"
                        checked={reportData.finalComments.wellbeingOpinion === "yes"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              wellbeingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="wellbeing-yes" className="text-sm font-medium">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="wellbeing-no"
                        name="wellbeing-opinion"
                        value="no"
                        checked={reportData.finalComments.wellbeingOpinion === "no"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              wellbeingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="wellbeing-no" className="text-sm font-medium">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="wellbeing-not-sure"
                        name="wellbeing-opinion"
                        value="not-sure"
                        checked={reportData.finalComments.wellbeingOpinion === "not-sure"}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            finalComments: {
                              ...prev.finalComments,
                              wellbeingOpinion: e.target.value as "yes" | "no" | "not-sure",
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="wellbeing-not-sure" className="text-sm font-medium">
                        Not sure
                      </Label>
                    </div>
                  </div>
                </div>
                
                {(reportData.finalComments.wellbeingOpinion === "no" || reportData.finalComments.wellbeingOpinion === "not-sure") && (
                  <div>
                    <Label htmlFor="wellbeing-explanation" className="text-sm font-medium">
                      Brief explanation (required) *
                    </Label>
                    <Textarea
                      id="wellbeing-explanation"
                      value={reportData.finalComments.wellbeingExplanation}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          finalComments: {
                            ...prev.finalComments,
                            wellbeingExplanation: e.target.value,
                          },
                        }))
                      }
                      placeholder="Please explain your concerns or uncertainties about wellbeing promotion..."
                      className="mt-2 min-h-[80px]"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Information Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Regulation 44.4 Compliance</p>
                    <p>
                      These responses fulfill the legal requirements for Independent Person reports under Regulation 44.4. 
                      The data will be mapped to the following PDF fields:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                      <li><strong>IP_SafeguardingOpinion:</strong> Safeguarding response</li>
                      <li><strong>IP_SafeguardingExplanation:</strong> Safeguarding explanation (if applicable)</li>
                      <li><strong>IP_WellbeingOpinion:</strong> Wellbeing response</li>
                      <li><strong>IP_WellbeingExplanation:</strong> Wellbeing explanation (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Review and Download Section */}
          <Card
            className={`mb-8 bg-white relative ${!isFormUnlocked ? "opacity-50" : ""}`}
          >
            {!isFormUnlocked && (
              <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center z-10">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border text-sm text-gray-600">
                  Select a setting type above to unlock this section
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Review & Download Report
              </CardTitle>
              <CardDescription>
                Review your complete report, make final edits, and choose from
                multiple output formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Preview Tabs */}
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual Report</TabsTrigger>
                  <TabsTrigger value="ai-enhanced">AI-Enhanced</TabsTrigger>
                  <TabsTrigger value="child-friendly">
                    Child-Friendly
                  </TabsTrigger>
                </TabsList>

                {/* Manual Report Tab */}
                <TabsContent value="manual" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Manual Report Preview
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your report exactly as written - no AI modifications
                      </p>
                    </div>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="default"
                      className="min-w-[150px]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                    <div className="space-y-6">
                      {/* Report Header */}
                      <div className="border-b pb-4">
                        <h2 className="text-xl font-bold mb-2">
                          {reportData.settingType === "unregistered_provision"
                            ? "Regulation 44-Style Assurance Review Report"
                            : "Regulation 44 Visit Report"}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Home:</strong> {reportData.homeName}
                          </div>
                          <div>
                            <strong>Date:</strong>{" "}
                            {new Date(
                              reportData.visitDate,
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Address:</strong> {reportData.homeAddress}
                          </div>
                          <div>
                            <strong>Visit Type:</strong>{" "}
                            {reportData.visitType || "Not specified"}
                          </div>
                        </div>
                      </div>

                      {/* Report Sections */}
                      {reportData.sections
                        .filter((section) => section.content.trim())
                        .map((section) => (
                          <div key={section.id} className="border-b pb-4">
                            <h3 className="font-semibold text-lg mb-2">
                              {section.title}
                            </h3>
                            <Textarea
                              value={section.content}
                              onChange={(e) =>
                                handleSectionContentChange(
                                  section.id,
                                  e.target.value,
                                )
                              }
                              className="min-h-[100px] bg-white"
                              placeholder={`Edit ${section.title.toLowerCase()} content...`}
                            />
                            {section.images.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-2">
                                  Attached Images: {section.images.length}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Actions Section */}
                      {reportData.actions.length > 0 && (
                        <div className="border-b pb-4">
                          <h3 className="font-semibold text-lg mb-2">
                            Actions & Recommendations
                          </h3>
                          <div className="space-y-2">
                            {reportData.actions.map((action, index) => (
                              <div
                                key={action.id}
                                className="p-3 bg-white rounded border"
                              >
                                <p className="font-medium">
                                  {index + 1}. {action.description}
                                </p>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>
                                    Responsible: {action.responsiblePerson}
                                  </span>{" "}
                                  |
                                  <span>
                                    {" "}
                                    Deadline:{" "}
                                    {new Date(
                                      action.deadline,
                                    ).toLocaleDateString()}
                                  </span>{" "}
                                  |
                                  <span>
                                    {" "}
                                    Status: {action.status.replace("-", " ")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations Summary */}
                      {reportData.recommendationsSummary && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            Recommendations Summary
                          </h3>
                          <Textarea
                            value={reportData.recommendationsSummary}
                            onChange={(e) =>
                              setReportData((prev) => ({
                                ...prev,
                                recommendationsSummary: e.target.value,
                              }))
                            }
                            className="min-h-[100px] bg-white"
                            placeholder="Edit recommendations summary..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* AI-Enhanced Report Tab */}
                <TabsContent value="ai-enhanced" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        AI-Enhanced Report
                      </h3>
                      <p className="text-sm text-gray-600">
                        Professional AI-polished version with improved structure
                        and tone
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!aiPolishedContent && (
                        <Button
                          onClick={generateAIPolishedReport}
                          disabled={isGeneratingAIPolished}
                          variant="default"
                        >
                          {isGeneratingAIPolished ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate AI Version
                            </>
                          )}
                        </Button>
                      )}
                      {aiPolishedContent && (
                        <>
                          <Button
                            onClick={() => setAiPolishedContent("")}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                          <Button
                            onClick={handleDownloadAIPolishedPDF}
                            variant="default"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {aiPolishedContent ? (
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                      <Textarea
                        value={aiPolishedContent}
                        onChange={(e) => setAiPolishedContent(e.target.value)}
                        className="min-h-[500px] bg-white text-sm"
                        placeholder="AI-enhanced content will appear here..."
                      />
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                              AI-Enhanced Version
                            </p>
                            <p>
                              This version has been professionally enhanced
                              while maintaining the accuracy of your
                              observations. You can edit the content above
                              before downloading.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 text-center bg-gray-50">
                      <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        AI-Enhanced Report Not Generated
                      </p>
                      <p className="text-sm text-gray-500">
                        Click "Generate AI Version" to create a professionally
                        polished version of your report.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Child-Friendly Summary Tab */}
                <TabsContent value="child-friendly" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Child-Friendly Summary
                      </h3>
                      <p className="text-sm text-gray-600">
                        Simplified, age-appropriate version for young people
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!childFriendlySummary && (
                        <Button
                          onClick={generateChildFriendlySummary}
                          disabled={isGeneratingChildFriendly}
                          variant="secondary"
                        >
                          {isGeneratingChildFriendly ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 mr-2" />
                              Generate Summary
                            </>
                          )}
                        </Button>
                      )}
                      {childFriendlySummary && (
                        <>
                          <Button
                            onClick={() => {
                              setChildFriendlySummary("");
                              setShowChildFriendlyPreview(false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                          <Button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                childFriendlySummary,
                              )
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            onClick={handleDownloadChildFriendlyPDF}
                            variant="secondary"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {childFriendlySummary ? (
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                      <Textarea
                        value={childFriendlySummary}
                        onChange={(e) =>
                          setChildFriendlySummary(e.target.value)
                        }
                        className="min-h-[500px] bg-white text-sm"
                        placeholder="Child-friendly summary will appear here..."
                      />
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <User className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-purple-800">
                            <p className="font-medium mb-1">
                              For Internal Use Only
                            </p>
                            <p>
                              This child-friendly summary is designed to help
                              you prepare accessible information for young
                              people in the home. You can edit the content above
                              before downloading.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 text-center bg-gray-50">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Child-Friendly Summary Not Generated
                      </p>
                      <p className="text-sm text-gray-500">
                        Click "Generate Summary" to create a simplified version
                        that can be shared with young people.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Legacy AI Summary (kept for backward compatibility) */}
              {aiGeneratedContent && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-600">
                      Legacy AI Summary
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Legacy
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
                  <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                    <Textarea
                      value={aiGeneratedContent}
                      onChange={(e) => setAiGeneratedContent(e.target.value)}
                      className="min-h-[150px] text-sm border-0 focus-visible:ring-0 resize-none bg-gray-50"
                      placeholder="Legacy AI summary..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sticky Action Bar */}
          <div className="sticky bottom-0 bg-white border-t p-4 -mx-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-sm text-gray-500">
                {lastSaved ? (
                  <div className="flex items-center space-x-2">
                    <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    {!isOnline && hasOfflineChanges && (
                      <Badge variant="secondary" className="text-xs">
                        <CloudOff className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                    {isOnline && !hasOfflineChanges && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        <Cloud className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    )}
                  </div>
                ) : (
                  "Not saved yet"
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSaveDraft()}
                  disabled={!isFormUnlocked}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={!isFormUnlocked}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={!isFormUnlocked}>
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
      )}
    </div>
  );
};

export default ReportBuilder;
