export interface MediaFile {
  id: number;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  duration?: number;
  transcription?: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisData?: string;
  score?: number;
  recommendation?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  mentorId?: number;
  mentorName?: string;
  mentorEmail?: string;
}

export interface SessionAnalysis {
  id: number;
  fileId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  estimatedTime?: string;
  startedAt?: string;
  completedAt?: string;
  results?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  overallScore: number;
  structureCompliance: {
    goalClarity: number;
    questionQuality: number;
    feedbackProvision: number;
    actionPlanning: number;
    mentorAdvice?: {
      proof: string;
      score: number;
    };
  };
  recommendations: string[];
  keyInsights: string[];
  strengths: string[];
  areasForImprovement: string[];
  competencyAnalysis?: CompetencyAnalysis[];
}

export interface CompetencyAnalysis {
  criterion: string;
  competence: string;
  definition: string;
  markers: Array<{
    id: number;
    name: string;
    observed: boolean;
    explanation?: string;
  }>;
  overall_competence_observed: boolean;
}

export interface UploadOptions {
  transcriptionEnabled: boolean;
  autoAnalysis: boolean;
  language?: string;
  quality?: string;
  extractAudio?: boolean;
  audioFormat?: 'wav' | 'mp3' | 'm4a';
  isAudioExtract?: boolean;
  originalFileName?: string;
}

export interface UploadProgress {
  fileId: number;
  progress: number;
  stage: string;
  status: 'uploading' | 'processing' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  error?: string;
}

export interface SessionStats {
  totalSessions: number;
  analyzedSessions: number;
  averageScore: number;
  totalDuration: number;
  recentSessions: MediaFile[];
}

export interface CreateSessionData {
  title: string;
  description?: string;
  mentorId?: number;
  scheduledDate?: string;
  duration?: number;
  tags?: string[];
}

export interface SessionDetail {
  id: number;
  title: string;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  score: number;
  date: string;
  duration: number;
  status: 'completed' | 'in_progress' | 'scheduled';
  recommendation: string;
  notes?: string;
  transcription?: string;
  analysisData?: AnalysisResult;
  fileType?: string;
  fileSize?: number;
}




