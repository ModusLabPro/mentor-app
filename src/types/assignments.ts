export enum CourseAssignmentType {
  ANALYSIS = 'analysis',
  QUESTION_ANSWER = 'question_answer',
  AI_TRAINER = 'ai_trainer',
  AI_SESSION_TRAINER = 'ai_session_trainer'
}

export enum CourseAssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum CourseAssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum AnalysisResultType {
  TEXT = 'text',
  JSON = 'json',
  STRUCTURED = 'structured'
}

export interface AnalysisQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'single_choice';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface QuestionAnswerQuestion {
  id?: number;
  order: number;
  question: string;
  description?: string;
  keywords?: string[];
  comments?: string;
  required?: boolean;
}

export interface AITrainerTask {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'simulation' | 'assessment';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // в минутах
  instructions: string;
  expectedOutcome: string;
  criteria: string[];
}

export interface AITrainerChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  contextLength: number;
  personality: string;
  responseStyle: 'formal' | 'casual' | 'encouraging' | 'strict';
  language: string;
}

export interface SessionStructure {
  title: string;
  description: string;
  totalDuration: number; // в минутах
  stages: SessionStage[];
}

export interface SessionStage {
  id: string;
  title: string;
  description: string;
  duration: number; // в минутах
  goals: string[];
  keyQuestions: string[];
  mentorGuidelines: string;
  order: number;
}

export interface SessionChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  contextLength: number;
  personality: string;
  responseStyle: 'formal' | 'casual' | 'encouraging' | 'strict';
  language: string;
  checklist: string[];
}

export interface CourseAssignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  type: CourseAssignmentType;
  status: CourseAssignmentStatus;
  priority: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags: string[];
  maxScore: number;
  lessonId?: number;
  // Analysis fields
  analysisResultType?: AnalysisResultType;
  analysisQuestions?: AnalysisQuestion[];
  // Question-Answer fields
  questionAnswerData?: {
    title: string;
    questions: QuestionAnswerQuestion[];
  };
  // AI Trainer fields
  aiTrainerData?: {
    title: string;
    description: string;
    tasks: AITrainerTask[];
    chatSettings: AITrainerChatSettings;
  };
  // AI Session Trainer fields
  aiSessionTrainerData?: {
    title: string;
    description: string;
    sessionStructure: SessionStructure;
    chatSettings: SessionChatSettings;
  };
  course?: {
    id: number;
    title: string;
  };
  submissions: CourseAssignmentSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseAssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  score?: number;
  feedback?: string;
  adminFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  // Analysis submission data
  analysisData?: any;
  // Question-Answer submission data
  questionAnswerData?: QuestionAnswerSubmissionData;
  // AI Trainer submission data
  aiTrainerData?: any;
  // AI Session Trainer submission data
  aiSessionTrainerData?: any;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface QuestionAnswerSubmissionData {
  answers: {
    questionId: string;
    answer: string | number | string[];
  }[];
}

export interface CreateCourseAssignmentData {
  title: string;
  description: string;
  type: CourseAssignmentType;
  priority?: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags?: string[];
  maxScore: number;
  lessonId?: number;
  // Analysis fields
  analysisResultType?: AnalysisResultType;
  analysisQuestions?: AnalysisQuestion[];
  // Question-Answer fields
  questionAnswerData?: {
    title: string;
    questions: QuestionAnswerQuestion[];
  };
  // AI Trainer fields
  aiTrainerData?: {
    title: string;
    description: string;
    tasks: AITrainerTask[];
    chatSettings: AITrainerChatSettings;
  };
  // AI Session Trainer fields
  aiSessionTrainerData?: {
    title: string;
    description: string;
    sessionStructure: SessionStructure;
    chatSettings: SessionChatSettings;
  };
}

export interface CreateAnalysisAssignmentData {
  title: string;
  description: string;
  priority?: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags?: string[];
  maxScore: number;
  lessonId?: number;
  analysisResultType: AnalysisResultType;
  analysisQuestions: AnalysisQuestion[];
}

export interface CreateQuestionAnswerAssignmentData {
  title: string;
  description: string;
  priority?: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags?: string[];
  maxScore: number;
  lessonId?: number;
  questionAnswerData: {
    title: string;
    questions: QuestionAnswerQuestion[];
  };
}

export interface CreateAITrainerAssignmentData {
  title: string;
  description: string;
  priority?: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags?: string[];
  maxScore: number;
  lessonId?: number;
  aiTrainerData: {
    title: string;
    description: string;
    tasks: AITrainerTask[];
    chatSettings: AITrainerChatSettings;
  };
}

export interface CreateAISessionTrainerAssignmentData {
  title: string;
  description: string;
  priority?: CourseAssignmentPriority;
  dueDate?: string;
  instructions?: string;
  expectedOutcome?: string;
  estimatedHours?: number;
  tags?: string[];
  maxScore: number;
  lessonId?: number;
  aiSessionTrainerData: {
    title: string;
    description: string;
    sessionStructure: SessionStructure;
    chatSettings: SessionChatSettings;
  };
}

export interface AssignmentStats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface AIReviewResult {
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}
