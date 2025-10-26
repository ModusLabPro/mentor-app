import { apiService } from './apiService';
import { Test, CreateTestDto, UpdateTestDto, TestAttempt } from '../../types/tests';

class TestService {
  async getTests(courseId: number): Promise<Test[]> {
    try {
      return await apiService.get<Test[]>(`/tests?courseId=${courseId}`);
    } catch (error) {
      console.log('Error loading tests, using fallback');
      return this.getMockTestsForCourse(courseId);
    }
  }

  private getMockTestsForCourse(courseId: number): Test[] {
    // Возвращаем тесты для разных уроков курса
    const mockTests: Test[] = [
      {
        id: 1,
        title: 'Тест по основам менторинга',
        description: 'Проверьте свои знания основ менторинга',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 15,
        maxAttempts: 3,
        passingScore: 70,
        courseId: courseId,
        lessonId: 1,
        status: 'published' as any,
        tags: ['менторинг', 'основы'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      {
        id: 2,
        title: 'Тест по активному слушанию',
        description: 'Проверьте навыки активного слушания',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 20,
        maxAttempts: 3,
        passingScore: 75,
        courseId: courseId,
        lessonId: 2,
        status: 'published' as any,
        tags: ['слушание', 'активное'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      {
        id: 3,
        title: 'Тест по постановке целей',
        description: 'Проверьте умение ставить SMART-цели',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 25,
        maxAttempts: 3,
        passingScore: 80,
        courseId: courseId,
        lessonId: 3,
        status: 'published' as any,
        tags: ['цели', 'SMART'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      {
        id: 4,
        title: 'Тест по обратной связи',
        description: 'Проверьте навыки предоставления обратной связи',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 18,
        maxAttempts: 3,
        passingScore: 75,
        courseId: courseId,
        lessonId: 4,
        status: 'published' as any,
        tags: ['обратная связь', 'коммуникация'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      {
        id: 5,
        title: 'Тест по решению конфликтов',
        description: 'Проверьте умение разрешать конфликтные ситуации',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 22,
        maxAttempts: 3,
        passingScore: 80,
        courseId: courseId,
        lessonId: 5,
        status: 'published' as any,
        tags: ['конфликты', 'решение'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      }
    ];

    return mockTests;
  }

  async getTestById(testId: number): Promise<Test> {
    try {
      return await apiService.get<Test>(`/tests/${testId}`);
    } catch (error) {
      console.log('Error loading test by ID, using fallback');
      return this.getMockTestById(testId);
    }
  }

  private getMockTestById(testId: number): Test {
    const mockTests: Record<number, Test> = {
      1: {
        id: 1,
        title: 'Тест по основам менторинга',
        description: 'Проверьте свои знания основ менторинга',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 15,
        maxAttempts: 3,
        passingScore: 70,
        courseId: 1,
        status: 'published' as any,
        tags: ['менторинг', 'основы'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      2: {
        id: 2,
        title: 'Тест по активному слушанию',
        description: 'Проверьте навыки активного слушания',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 20,
        maxAttempts: 3,
        passingScore: 75,
        courseId: 1,
        status: 'published' as any,
        tags: ['слушание', 'активное'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      3: {
        id: 3,
        title: 'Тест по постановке целей',
        description: 'Проверьте умение ставить SMART-цели',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 25,
        maxAttempts: 3,
        passingScore: 80,
        courseId: 1,
        status: 'published' as any,
        tags: ['цели', 'SMART'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      4: {
        id: 4,
        title: 'Тест по обратной связи',
        description: 'Проверьте навыки предоставления обратной связи',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 18,
        maxAttempts: 3,
        passingScore: 75,
        courseId: 1,
        status: 'published' as any,
        tags: ['обратная связь', 'коммуникация'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      },
      5: {
        id: 5,
        title: 'Тест по решению конфликтов',
        description: 'Проверьте умение разрешать конфликтные ситуации',
        instructions: 'Ответьте на все вопросы теста',
        timeLimit: 22,
        maxAttempts: 3,
        passingScore: 80,
        courseId: 1,
        status: 'published' as any,
        tags: ['конфликты', 'решение'],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1
      }
    };

    return mockTests[testId] || {
      id: testId,
      title: `Тест ${testId}`,
      description: `Описание теста ${testId}`,
      instructions: 'Ответьте на все вопросы теста',
      timeLimit: 15,
      maxAttempts: 3,
      passingScore: 70,
      courseId: 1,
      status: 'published' as any,
      tags: [],
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 1
    };
  }

  async createTest(courseId: number, data: CreateTestDto): Promise<Test> {
    return apiService.post<Test>(`/courses/${courseId}/tests`, data);
  }

  async updateTest(testId: number, data: UpdateTestDto): Promise<Test> {
    return apiService.put<Test>(`/tests/${testId}`, data);
  }

  async deleteTest(testId: number): Promise<void> {
    return apiService.delete<void>(`/tests/${testId}`);
  }

  async startTest(testId: number): Promise<TestAttempt> {
    return apiService.post<TestAttempt>(`/tests/${testId}/start`);
  }

  async submitTest(testId: number, answers: Record<number, string | string[]>): Promise<TestAttempt> {
    console.log('testService.submitTest called with:', {
      testId,
      answers,
      endpoint: `/tests/${testId}/submit`,
      data: { answers }
    });
    return apiService.post<TestAttempt>(`/tests/${testId}/submit`, { answers });
  }

  async submitTestAttempt(attemptId: number, answers: Record<number, string | string[]>): Promise<TestAttempt> {
    console.log('testService.submitTestAttempt called with:', {
      attemptId,
      answers,
      endpoint: `/tests/attempts/${attemptId}/submit`,
      data: { answers }
    });
    return apiService.post<TestAttempt>(`/tests/attempts/${attemptId}/submit`, { answers });
  }

  async getTestAttempts(testId: number): Promise<TestAttempt[]> {
    try {
      return await apiService.get<TestAttempt[]>(`/tests/attempts?testId=${testId}`);
    } catch (error) {
      console.log('Error loading test attempts, using fallback');
      return []; // Нет попыток
    }
  }

  async getMyTestAttempts(): Promise<TestAttempt[]> {
    return apiService.get<TestAttempt[]>('/tests/attempts/my');
  }

  async getTestReviews(testId: number): Promise<TestReview[]> {
    try {
      return await apiService.get<TestReview[]>(`/tests/${testId}/reviews`);
    } catch (error) {
      console.log('Error loading test reviews, using fallback');
      return []; // Нет результатов ИИ
    }
  }

  async reviewTestWithAI(testId: number): Promise<any> {
    return apiService.post<any>(`/tests/${testId}/review-with-ai`);
  }

  async generateTestWithAI(courseId: number, prompt: string): Promise<ReadableStream> {
    const url = `${process.env.API_BASE_URL || 'http://localhost:4000/api'}/tests/generate-ai`;
    const token = await import('@react-native-async-storage/async-storage').then(storage => storage.default.getItem('token'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ courseId, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.body!;
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
}

export const testService = new TestService();
