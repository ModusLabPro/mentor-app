export type LearningMaterialType = 'article' | 'video' | 'podcast' | 'interactive' | 'document' | 'course';

export type LearningMaterialStatus = 'draft' | 'published' | 'archived';

export interface LearningMaterial {
  id: number;
  title: string;
  description: string;
  content: string;
  contentFormatted?: any[];
  type: LearningMaterialType;
  status: LearningMaterialStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // в минутах
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  resources: LearningMaterialResource[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  organizationId?: number;
  assignedMentorIds?: number[];
  assignedMentors?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }[];
}

export interface LearningMaterialResource {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'document' | 'link' | 'image' | 'interactive';
  url: string;
  description?: string;
  duration?: number;
  size?: number;
  format?: string;
  thumbnail?: string;
}

export interface LearningProgress {
  id: number;
  materialId: number;
  userId: number;
  progress: number; // процент завершения
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  timeSpent: number; // в минутах
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  material?: LearningMaterial;
}

export interface CreateLearningMaterialData {
  title: string;
  description: string;
  content: string;
  contentFormatted?: any[];
  type: LearningMaterialType;
  status?: LearningMaterialStatus;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  resources?: Omit<LearningMaterialResource, 'id'>[];
  metadata?: Record<string, any>;
  assignedMentorIds?: number[];
}

export interface UpdateLearningMaterialData {
  title?: string;
  description?: string;
  content?: string;
  contentFormatted?: any[];
  type?: LearningMaterialType;
  status?: LearningMaterialStatus;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  resources?: Omit<LearningMaterialResource, 'id'>[];
  metadata?: Record<string, any>;
  assignedMentorIds?: number[];
}


