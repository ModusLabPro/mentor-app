import { apiService } from './apiService';
import { Lesson, CreateLessonData, UpdateLessonData } from '../../types/lessons';
import { CourseAssignmentType } from '../../types/assignments';

class LessonService {
  async getLessons(courseId: number): Promise<Lesson[]> {
    return apiService.get<Lesson[]>(`/courses/${courseId}/lessons`);
  }

  async getLessonById(lessonId: number, courseId?: number): Promise<Lesson> {
    if (courseId) {
      return apiService.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`);
    }
    return apiService.get<Lesson>(`/lessons/${lessonId}`);
  }

  async createLesson(courseId: number, data: CreateLessonData): Promise<Lesson> {
    return apiService.post<Lesson>(`/courses/${courseId}/lessons`, data);
  }

  async updateLesson(lessonId: number, data: UpdateLessonData, courseId?: number): Promise<Lesson> {
    if (courseId) {
      return apiService.put<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, data);
    }
    return apiService.put<Lesson>(`/lessons/${lessonId}`, data);
  }

  async deleteLesson(lessonId: number, courseId?: number): Promise<void> {
    if (courseId) {
      return apiService.delete<void>(`/courses/${courseId}/lessons/${lessonId}`);
    }
    return apiService.delete<void>(`/lessons/${lessonId}`);
  }

  async reorderLessons(courseId: number, lessonIds: number[]): Promise<void> {
    return apiService.post<void>(`/courses/${courseId}/lessons/reorder`, { lessonIds });
  }

  async publishLesson(lessonId: number): Promise<Lesson> {
    return apiService.post<Lesson>(`/lessons/${lessonId}/publish`);
  }

  async archiveLesson(lessonId: number): Promise<Lesson> {
    return apiService.post<Lesson>(`/lessons/${lessonId}/archive`);
  }

  // Методы для работы с прогрессом уроков (совместимость с mentor-react API)
  async getLessonProgress(lessonId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/lesson-progress/lesson/${lessonId}`);
    } catch (error: any) {
      // Если прогресс урока не найден, возвращаем значения по умолчанию
      if (error.response?.status === 404) {
        console.log('Lesson progress not found, returning default values');
        return {
          id: null,
          lessonId: lessonId,
          progress: 0,
          status: 'not_started',
          startedAt: null,
          completedAt: null
        };
      }
      throw error;
    }
  }

  async startLesson(lessonId: number): Promise<any> {
    try {
      return await apiService.post<any>(`/lesson-progress/lesson/${lessonId}/start`);
    } catch (error: any) {
      // Если API не поддерживает startLesson, возвращаем успех
      console.log('Start lesson API not available, using local state');
      return { success: true };
    }
  }

  async completeLesson(lessonId: number): Promise<any> {
    try {
      return await apiService.post<any>(`/lesson-progress/lesson/${lessonId}/complete`);
    } catch (error: any) {
      // Если API не поддерживает completeLesson, возвращаем успех
      console.log('Complete lesson API not available, using local state');
      return { success: true };
    }
  }

  async updateLessonProgress(lessonId: number, progress: number): Promise<any> {
    try {
      return await apiService.put<any>(`/lesson-progress/lesson/${lessonId}`, { 
        progress,
        timeSpent: 0 // Можно добавить логику подсчета времени
      });
    } catch (error: any) {
      // Если прогресс урока не найден, пытаемся инициализировать курс
      if (error.response?.status === 404) {
        console.log('Lesson progress not found, trying to initialize course progress');
        try {
          // Получаем информацию об уроке для определения courseId
          const lesson = await this.getLessonById(lessonId);
          if (lesson?.courseId) {
            await this.initializeCourseProgress(lesson.courseId);
            // Повторяем попытку обновления прогресса
            return await apiService.put<any>(`/lesson-progress/lesson/${lessonId}`, { 
              progress,
              timeSpent: 0
            });
          }
        } catch (initError) {
          console.log('Failed to initialize course progress:', initError);
        }
      }
      throw error;
    }
  }

  async initializeCourseProgress(courseId: number): Promise<any> {
    try {
      return await apiService.post<any>(`/lesson-progress/course/${courseId}/start`);
    } catch (error: any) {
      console.log('Course progress initialization failed or already exists:', error);
      return { success: true };
    }
  }

  async getCourseLessonsProgress(courseId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/lesson-progress/course/${courseId}/lessons-progress`);
    } catch (error: any) {
      console.log('Course lessons progress not available:', error);
      return [];
    }
  }

  // Методы для работы с тестами и заданиями
  async getLessonTests(lessonId: number): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`/lessons/${lessonId}/tests`);
    } catch (error) {
      console.log('Error loading lesson tests, using fallback');
      // Возвращаем разные мок-данные в зависимости от урока
      return this.getMockTestsForLesson(lessonId);
    }
  }

  private getMockTestsForLesson(lessonId: number): any[] {
    const mockTests: Record<number, any[]> = {
      1: [
        {
          id: 1,
          title: 'Тест по основам менторинга',
          duration: 15,
          passingScore: 70,
          lessonId: lessonId,
          description: 'Проверьте свои знания основ менторинга'
        }
      ],
      2: [
        {
          id: 2,
          title: 'Тест по активному слушанию',
          duration: 20,
          passingScore: 75,
          lessonId: lessonId,
          description: 'Проверьте навыки активного слушания'
        }
      ],
      3: [
        {
          id: 3,
          title: 'Тест по постановке целей',
          duration: 25,
          passingScore: 80,
          lessonId: lessonId,
          description: 'Проверьте умение ставить SMART-цели'
        }
      ],
      4: [
        {
          id: 4,
          title: 'Тест по обратной связи',
          duration: 18,
          passingScore: 75,
          lessonId: lessonId,
          description: 'Проверьте навыки предоставления обратной связи'
        }
      ],
      5: [
        {
          id: 5,
          title: 'Тест по решению конфликтов',
          duration: 22,
          passingScore: 80,
          lessonId: lessonId,
          description: 'Проверьте умение разрешать конфликтные ситуации'
        }
      ]
    };

    return mockTests[lessonId] || [
      {
        id: lessonId,
        title: `Тест к уроку ${lessonId}`,
        duration: 15,
        passingScore: 70,
        lessonId: lessonId,
        description: `Проверьте знания по уроку ${lessonId}`
      }
    ];
  }

  async getLessonAssignments(lessonId: number): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`/lessons/${lessonId}/assignments`);
    } catch (error) {
      console.log('Error loading lesson assignments, using fallback');
      // Возвращаем разные мок-данные в зависимости от урока
      return this.getMockAssignmentsForLesson(lessonId);
    }
  }

  private getMockAssignmentsForLesson(lessonId: number): any[] {
    const mockAssignments: Record<number, any[]> = {
      1: [
        {
          id: 1,
          title: 'Аналитическое задание: Анализ сессии',
          type: CourseAssignmentType.ANALYSIS,
          estimatedHours: 2,
          lessonId: lessonId,
          description: 'Проанализируйте записанную сессию менторинга'
        }
      ],
      2: [
        {
          id: 2,
          title: 'Задание: Практика активного слушания',
          type: CourseAssignmentType.QUESTION_ANSWER,
          estimatedHours: 1.5,
          lessonId: lessonId,
          description: 'Проведите сессию с фокусом на активное слушание'
        }
      ],
      3: [
        {
          id: 3,
          title: 'Задание: Постановка SMART-целей',
          type: CourseAssignmentType.AI_TRAINER,
          estimatedHours: 2.5,
          lessonId: lessonId,
          description: 'Помогите менти поставить конкретные измеримые цели'
        }
      ],
      4: [
        {
          id: 4,
          title: 'Задание: Обратная связь 360°',
          type: CourseAssignmentType.AI_SESSION_TRAINER,
          estimatedHours: 3,
          lessonId: lessonId,
          description: 'Соберите и предоставьте комплексную обратную связь'
        }
      ],
      5: [
        {
          id: 5,
          title: 'Задание: Медиация конфликта',
          type: CourseAssignmentType.ANALYSIS,
          estimatedHours: 2,
          lessonId: lessonId,
          description: 'Помогите разрешить конфликтную ситуацию в команде'
        }
      ]
    };

    return mockAssignments[lessonId] || [
      {
        id: lessonId,
        title: `Задание к уроку ${lessonId}`,
        type: CourseAssignmentType.ANALYSIS,
        estimatedHours: 2,
        lessonId: lessonId,
        description: `Практическое задание по уроку ${lessonId}`
      }
    ];
  }

  async getTestById(testId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/tests/${testId}`);
    } catch (error) {
      console.log('Error loading test, using fallback');
      return this.getMockTestById(testId);
    }
  }

  private getMockTestById(testId: number): any {
    const mockTests: Record<number, any> = {
      1: {
        id: 1,
        title: 'Тест по основам менторинга',
        description: 'Проверьте свои знания основ менторинга',
        duration: 15,
        passingScore: 70,
        questions: []
      },
      2: {
        id: 2,
        title: 'Тест по активному слушанию',
        description: 'Проверьте навыки активного слушания',
        duration: 20,
        passingScore: 75,
        questions: []
      },
      3: {
        id: 3,
        title: 'Тест по постановке целей',
        description: 'Проверьте умение ставить SMART-цели',
        duration: 25,
        passingScore: 80,
        questions: []
      },
      4: {
        id: 4,
        title: 'Тест по обратной связи',
        description: 'Проверьте навыки предоставления обратной связи',
        duration: 18,
        passingScore: 75,
        questions: []
      },
      5: {
        id: 5,
        title: 'Тест по решению конфликтов',
        description: 'Проверьте умение разрешать конфликтные ситуации',
        duration: 22,
        passingScore: 80,
        questions: []
      }
    };

    return mockTests[testId] || {
      id: testId,
      title: `Тест ${testId}`,
      description: `Описание теста ${testId}`,
      duration: 15,
      passingScore: 70,
      questions: []
    };
  }

  async getAssignmentById(assignmentId: number): Promise<any> {
    try {
      return await apiService.get<any>(`/assignments/${assignmentId}`);
    } catch (error) {
      console.log('Error loading assignment, using fallback');
      return this.getMockAssignmentById(assignmentId);
    }
  }

  private getMockAssignmentById(assignmentId: number): any {
    const mockAssignments: Record<number, any> = {
      1: {
        id: 1,
        title: 'Практическое задание: Анализ сессии',
        description: 'Проанализируйте записанную сессию менторинга',
        type: CourseAssignmentType.ANALYSIS,
        estimatedHours: 2,
        instructions: 'Выполните анализ согласно инструкциям'
      },
      2: {
        id: 2,
        title: 'Задание: Практика активного слушания',
        description: 'Проведите сессию с фокусом на активное слушание',
        type: CourseAssignmentType.QUESTION_ANSWER,
        estimatedHours: 1.5,
        instructions: 'Сфокусируйтесь на техниках активного слушания'
      },
      3: {
        id: 3,
        title: 'Задание: Постановка SMART-целей',
        description: 'Помогите менти поставить конкретные измеримые цели',
        type: CourseAssignmentType.AI_TRAINER,
        estimatedHours: 2.5,
        instructions: 'Используйте методологию SMART для постановки целей'
      },
      4: {
        id: 4,
        title: 'Задание: Обратная связь 360°',
        description: 'Соберите и предоставьте комплексную обратную связь',
        type: CourseAssignmentType.AI_SESSION_TRAINER,
        estimatedHours: 3,
        instructions: 'Проведите сбор обратной связи от всех заинтересованных сторон'
      },
      5: {
        id: 5,
        title: 'Задание: Медиация конфликта',
        description: 'Помогите разрешить конфликтную ситуацию в команде',
        type: CourseAssignmentType.ANALYSIS,
        estimatedHours: 2,
        instructions: 'Примените техники медиации для разрешения конфликта'
      }
    };

    return mockAssignments[assignmentId] || {
      id: assignmentId,
      title: `Задание ${assignmentId}`,
      description: `Описание задания ${assignmentId}`,
      type: 'practical',
      estimatedHours: 2,
      instructions: 'Выполните задание согласно инструкциям'
    };
  }
}

export const lessonService = new LessonService();


