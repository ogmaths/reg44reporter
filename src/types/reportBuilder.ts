// Interfaces and types moved from ReportBuilder.tsx

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  images: File[];
  isRecording: boolean;
}

export interface Action {
  id: string;
  description: string;
  responsiblePerson: string;
  deadline: string;
  status: "not-started" | "in-progress" | "completed";
  createdDate: string;
  homeId: string;
  progressUpdate?: string;
}

export interface ChildFeedback {
  id: string;
  initialsOrCode: string;
  age: string;
  summary: string;
  concernsRaised: boolean;
  actionTaken: string;
  includeInAISummary: boolean;
}

export interface StaffFeedback {
  id: string;
  initialsOrCode: string;
  role: string;
  questionsAsked: string;
  keyPointsRaised: string;
  concernsRaised: boolean;
  includeInAISummary: boolean;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  notes: string;
}

export interface FinalComments {
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

export interface QualityCareData {
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

export interface EducationData {
  attendanceStatus: string;
  engagementSummary: string;
  educationPlans: Array<{
    id: string;
    name: string;
    checked: boolean;
  }>;
}

export interface EnjoymentAchievementData {
  selectedHobbies: string[];
  engagementSupport: string;
  activityLogs: Array<{
    id: string;
    activity: string;
    date: string;
    notes: string;
  }>;
}

export interface HealthWellbeingData {
  healthRegistration: boolean;
  services: string[];
  notes: string;
}

export interface PositiveRelationshipsData {
  bondingExamples: string;
  conflictResolutionExamples: string;
  concernsRaised: boolean;
}

export interface CarePlanningData {
  planProgress: string;
  needsAreas: string[];
  identityComments: string;
  independenceComments: string;
  generalComments: string;
}

export interface FollowUpAction {
  id: string;
  description: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  notes: string;
  originalDeadline: string;
  responsiblePerson: string;
}

export interface FollowUpData {
  actions: FollowUpAction[];
}

export interface LeadershipManagementData {
  managerImpact: string;
  staffStrengthsNeeds: string[];
  improvementAreas: boolean;
}

export interface ProtectionChildrenData {
  safeguardingChecklist: {
    policiesInPlace: boolean;
    staffUnderstanding: boolean;
    risksIdentified: boolean;
    childrenFeelSafe: boolean;
    incidentLogsUpToDate: boolean;
    physicalInterventionsReviewed: boolean;
    complaintsHandled: boolean;
    missingEventsFollowedUp: boolean;
    onlineSafetyPromoted: boolean;
    externalAgenciesEngaged: boolean;
    safetyConcernsEscalated: boolean;
  };
  safeguardingSummary: string;
  overallAssessment: "fully-meets" | "partially-meets" | "does-not-meet" | "";
}

export interface ReportData {
  homeName: string;
  homeAddress: string;
  visitDate: string;
  visitType: "announced" | "unannounced" | "";
  purposeOfVisit: string;
  settingType: "registered_childrens_home" | "welfare_monitoring_visit" | "";
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
  protectionChildrenData: ProtectionChildrenData;
  homeId?: string;
  visitId?: string;
}

export interface ReportVersion {
  id: string;
  timestamp: Date;
  status: "draft" | "submitted";
  data: ReportData;
  description: string;
}

export type ViewMode = "create" | "review";
export type FormType = "quick";
export type FormStep = "selection" | "form"; 