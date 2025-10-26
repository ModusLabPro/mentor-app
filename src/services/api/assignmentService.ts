import { apiService } from './apiService';
import { 
  CourseAssignment, 
  CreateCourseAssignmentData, 
  CreateAnalysisAssignmentData,
  CreateQuestionAnswerAssignmentData,
  CreateAITrainerAssignmentData,
  CreateAISessionTrainerAssignmentData,
  CourseAssignmentSubmission,
  AssignmentStats
} from '../../types/assignments';

class AssignmentService {
  async getAssignments(): Promise<CourseAssignment[]> {
    return apiService.get<CourseAssignment[]>('/assignments');
  }

  async getMyAssignments(): Promise<CourseAssignment[]> {
    return apiService.get<CourseAssignment[]>('/assignments/my');
  }

  async getAssignmentById(id: number): Promise<CourseAssignment> {
    try {
      return await apiService.get<CourseAssignment>(`/assignments/${id}`);
    } catch (error) {
      console.log('Error loading assignment by ID, using fallback');
      return this.getMockAssignmentById(id);
    }
  }

  private getMockAssignmentById(id: number): CourseAssignment {
    const mockAssignments: Record<number, CourseAssignment> = {
      1: {
        id: 1,
        title: 'Практическое задание: Анализ сессии',
        description: 'Проанализируйте записанную сессию менторинга',
        type: 'practical' as any,
        estimatedHours: 2,
        courseId: 1,
        lessonId: 1,
        status: 'published' as any,
        priority: 'medium' as any,
        maxScore: 100,
        dueDate: null,
        tags: ['анализ', 'сессия'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 1
      },
      2: {
        id: 2,
        title: 'Задание: Практика активного слушания',
        description: 'Проведите сессию с фокусом на активное слушание',
        type: 'practical' as any,
        estimatedHours: 1.5,
        courseId: 1,
        lessonId: 2,
        status: 'published' as any,
        priority: 'medium' as any,
        maxScore: 100,
        dueDate: null,
        tags: ['слушание', 'практика'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 1
      },
      3: {
        id: 3,
        title: 'Задание: Постановка SMART-целей',
        description: 'Помогите менти поставить конкретные измеримые цели',
        type: 'practical' as any,
        estimatedHours: 2.5,
        courseId: 1,
        lessonId: 3,
        status: 'published' as any,
        priority: 'high' as any,
        maxScore: 100,
        dueDate: null,
        tags: ['цели', 'SMART'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 1
      },
      4: {
        id: 4,
        title: 'Задание: Обратная связь 360°',
        description: 'Соберите и предоставьте комплексную обратную связь',
        type: 'practical' as any,
        estimatedHours: 3,
        courseId: 1,
        lessonId: 4,
        status: 'published' as any,
        priority: 'high' as any,
        maxScore: 100,
        dueDate: null,
        tags: ['обратная связь', '360'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 1
      },
      5: {
        id: 5,
        title: 'Задание: Медиация конфликта',
        description: 'Помогите разрешить конфликтную ситуацию в команде',
        type: 'practical' as any,
        estimatedHours: 2,
        courseId: 1,
        lessonId: 5,
        status: 'published' as any,
        priority: 'medium' as any,
        maxScore: 100,
        dueDate: null,
        tags: ['конфликт', 'медиация'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 1
      }
    };

    return mockAssignments[id] || {
      id: id,
      title: `Задание ${id}`,
      description: `Описание задания ${id}`,
      type: 'practical' as any,
      estimatedHours: 2,
      courseId: 1,
      lessonId: id,
      status: 'published' as any,
      priority: 'medium' as any,
      maxScore: 100,
      dueDate: null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: 1
    };
  }

  async getCourseAssignment(courseId: number, assignmentId: number): Promise<CourseAssignment> {
    try {
      return await apiService.get<CourseAssignment>(`/courses/${courseId}/assignments/${assignmentId}`);
    } catch (error) {
      console.log('Error loading course assignment, using fallback');
      return this.getMockAssignmentById(assignmentId);
    }
  }

  async getQuestionAnswerData(courseId: number, assignmentId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/courses/${courseId}/assignments/${assignmentId}/question-answer-data`);
    } catch (error) {
      console.log('Error loading question-answer data, using fallback');
      return {
        question: 'Вопрос по заданию',
        answer: 'Ответ на задание',
        instructions: 'Выполните задание согласно инструкциям'
      };
    }
  }

  async getCourseAssignments(courseId: number): Promise<CourseAssignment[]> {
    return apiService.get<CourseAssignment[]>(`/courses/${courseId}/assignments`);
  }

  async createAssignment(data: CreateCourseAssignmentData): Promise<CourseAssignment> {
    return apiService.post<CourseAssignment>('/assignments', data);
  }

  async createAnalysisAssignment(courseId: number, data: CreateAnalysisAssignmentData): Promise<CourseAssignment> {
    return apiService.post<CourseAssignment>(`/courses/${courseId}/assignments/analysis`, data);
  }

  async createQuestionAnswerAssignment(courseId: number, data: CreateQuestionAnswerAssignmentData): Promise<CourseAssignment> {
    return apiService.post<CourseAssignment>(`/courses/${courseId}/assignments/question-answer`, data);
  }

  async createAITrainerAssignment(courseId: number, data: CreateAITrainerAssignmentData): Promise<CourseAssignment> {
    return apiService.post<CourseAssignment>(`/courses/${courseId}/assignments/ai-trainer`, data);
  }

  async createAISessionTrainerAssignment(courseId: number, data: CreateAISessionTrainerAssignmentData): Promise<CourseAssignment> {
    return apiService.post<CourseAssignment>(`/courses/${courseId}/assignments/ai-session-trainer`, data);
  }

  async updateAssignment(id: number, data: Partial<CreateCourseAssignmentData>): Promise<CourseAssignment> {
    return apiService.put<CourseAssignment>(`/assignments/${id}`, data);
  }

  async deleteAssignment(id: number): Promise<void> {
    return apiService.delete<void>(`/assignments/${id}`);
  }

  async submitAssignment(assignmentId: number, data: any): Promise<CourseAssignmentSubmission> {
    return apiService.post<CourseAssignmentSubmission>(`/assignments/${assignmentId}/submit`, data);
  }

  async getAssignmentSubmissions(assignmentId: number): Promise<CourseAssignmentSubmission[]> {
    return apiService.get<CourseAssignmentSubmission[]>(`/course-assignments/${assignmentId}/submissions`);
  }

  async getCourseAssignmentSubmissionStatus(assignmentId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/course-assignments/${assignmentId}/submission-status`);
    } catch (error) {
      console.log('Error loading submission status, using fallback');
      return null; // Нет отправки
    }
  }

  async getMySubmissions(): Promise<CourseAssignmentSubmission[]> {
    return apiService.get<CourseAssignmentSubmission[]>('/assignments/submissions/my');
  }

  async getAllSubmissions(): Promise<CourseAssignmentSubmission[]> {
    return apiService.get<CourseAssignmentSubmission[]>('/assignments/submissions/all');
  }

  async reviewAssignmentSubmission(submissionId: number, data: {
    score: number;
    feedback?: string;
    adminFeedback?: string;
  }): Promise<CourseAssignmentSubmission> {
    return apiService.put<CourseAssignmentSubmission>(`/assignments/submissions/${submissionId}/review`, data);
  }

  async getAssignmentStats(courseId: number): Promise<AssignmentStats> {
    return apiService.get<AssignmentStats>(`/courses/${courseId}/assignments/stats`);
  }

  async getAssignmentAIReview(assignmentId: number): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`/course-assignments/${assignmentId}/reviews`);
    } catch (error) {
      console.log('Error loading AI review, using fallback');
      return []; // Нет результатов ИИ
    }
  }

  async reviewAssignmentWithAI(assignmentId: number): Promise<any> {
    return apiService.post<any>(`/course-assignments/${assignmentId}/review-with-ai`);
  }

  // AI Session Trainer specific methods
  async generateCase(courseId: number, assignmentId: number, expertise: string): Promise<string> {
    console.log('🔍 API: Sending generateCase request:', { courseId, assignmentId, expertise });
    
    const url = `${process.env.API_BASE_URL || 'http://localhost:4000/api'}/courses/${courseId}/assignments/${assignmentId}/ai-session-trainer-generate-case`;
    const token = await import('@react-native-async-storage/async-storage').then(storage => storage.default.getItem('token'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ expertise }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API: Received case response:', data.response?.substring(0, 200));
    return data.response;
  }

  async generateAIResponse(courseId: number, assignmentId: number, message: string, conversationHistory?: any[]): Promise<string> {
    console.log('🔍 API: Sending generateAIResponse request:', { courseId, assignmentId, message: message.substring(0, 100) });
    
    const url = `${process.env.API_BASE_URL || 'http://localhost:4000/api'}/courses/${courseId}/assignments/${assignmentId}/ai-session-trainer-chat`;
    const token = await import('@react-native-async-storage/async-storage').then(storage => storage.default.getItem('token'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        message,
        conversationHistory
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API: Received AI response:', data.response?.substring(0, 200));
    return data.response;
  }

  async parseStream(stream: ReadableStream): Promise<AsyncGenerator<string>> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    return (async function* () {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  yield parsed.content;
                }
              } catch (e) {
                // Игнорируем ошибки парсинга
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }

  // Методы для отправки разных типов заданий
  async submitAnalysisAssignment(assignmentId: number, data: any): Promise<CourseAssignmentSubmission> {
    return apiService.post<CourseAssignmentSubmission>(`/analysis-assignments/${assignmentId}/submit`, data);
  }

  async submitQuestionAnswerAssignment(assignmentId: number, data: any): Promise<CourseAssignmentSubmission> {
    return apiService.post<CourseAssignmentSubmission>(`/course-assignments/${assignmentId}/submit`, data);
  }

  async submitAITrainerAssignment(assignmentId: number, data: any): Promise<CourseAssignmentSubmission> {
    return apiService.post<CourseAssignmentSubmission>(`/course-assignments/ai-trainer/${assignmentId}/submit`, data);
  }

  async submitAISessionTrainerAssignment(courseId: number, assignmentId: number, data: any): Promise<CourseAssignmentSubmission> {
    console.log('🔍 API: Submitting AI Session Trainer assignment:', { courseId, assignmentId, data });
    return apiService.post<CourseAssignmentSubmission>(`/courses/${courseId}/assignments/${assignmentId}/ai-session-trainer-submit`, data);
  }
}

export const assignmentService = new AssignmentService();
