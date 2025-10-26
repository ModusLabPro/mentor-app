export type LessonType = 'lecture' | 'practice' | 'interactive' | 'assessment' | 'resource';

export interface Lesson {
  id: number;
  courseId: number;
  topicId?: number;
  title: string;
  description: string;
  content: string;
  contentFormatted?: any[];
  type: LessonType;
  order: number;
  duration: number; // в минутах
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  resources: LessonResource[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  course?: {
    id: number;
    title: string;
  };
  topic?: {
    id: number;
    title: string;
  };
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'document' | 'link' | 'image';
  url: string;
  description?: string;
  duration?: number;
  size?: number;
  format?: string;
}

export interface CreateLessonData {
  title: string;
  description: string;
  content: string;
  contentFormatted?: any[];
  type: LessonType;
  order?: number;
  duration: number;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  resources?: Omit<LessonResource, 'id'>[];
  metadata?: Record<string, any>;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  content?: string;
  contentFormatted?: any[];
  type?: LessonType;
  order?: number;
  duration?: number;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  resources?: Omit<LessonResource, 'id'>[];
  metadata?: Record<string, any>;
}


