export interface Test {
  id: number;
  courseId: number;
  title: string;
  description: string;
  instructions: string;
  timeLimit?: number; // в минутах
  maxAttempts?: number;
  passingScore: number;
  questions: TestQuestion[];
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  course?: {
    id: number;
    title: string;
  };
  attempts?: TestAttempt[];
  reviews?: TestReview[];
}

export type TestQuestionType = 'single' | 'multiple' | 'text';

export interface TestQuestion {
  id: number;
  text: string;
  type: TestQuestionType;
  options?: TestQuestionOption[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  order: number;
}

export interface TestQuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface TestAttempt {
  id: number;
  testId: number;
  userId: number;
  answers: TestAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // в минутах
  startedAt: string;
  completedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TestAnswer {
  questionId: string;
  answer: string | string[] | number;
  isCorrect: boolean;
  points: number;
}

export interface TestReview {
  id: number;
  testId: number;
  userId: number;
  reviewerId: number;
  score: number;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTestDto {
  title: string;
  description: string;
  instructions: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore: number;
  questions: Omit<TestQuestion, 'id'>[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateTestDto {
  title?: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  questions?: Omit<TestQuestion, 'id'>[];
  tags?: string[];
  metadata?: Record<string, any>;
}
