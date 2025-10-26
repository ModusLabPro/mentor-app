export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: number;
  title: string;
  description: string;
  content: string;
  contentFormatted?: any[];
  status: CourseStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // в минутах
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
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
  metadata?: Record<string, any>;
  topics?: Topic[];
  lessons?: Lesson[];
  tests?: Test[];
  courseAssignments?: CourseAssignment[];
  courseProgress?: CourseProgress[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  content?: string;
  contentFormatted?: any[];
  status?: CourseStatus;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  assignedMentorIds?: number[];
  metadata?: Record<string, any>;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  content?: string;
  contentFormatted?: any[];
  status?: CourseStatus;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  assignedMentorIds?: number[];
  metadata?: Record<string, any>;
}

export interface CourseProgress {
  id: number;
  courseId: number;
  userId: number;
  progress: number; // процент завершения
  status: 'not_started' | 'in_progress' | 'completed';
  completedLessons: number[];
  completedTests: number[];
  completedAssignments: number[];
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  course?: Course;
}

export interface CourseStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
}

export interface CourseForReview {
  id: number;
  title: string;
  description: string;
  status: CourseStatus;
  difficulty: string;
  duration: number;
  createdAt: string;
  createdBy: number;
  submissionsCount: number;
  averageScore?: number;
  course?: Course;
}
