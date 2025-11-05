import { apiService } from './apiService';
import { 
  MediaFile, 
  SessionAnalysis, 
  AnalysisResult, 
  UploadOptions, 
  UploadProgress, 
  SessionStats, 
  CreateSessionData, 
  SessionDetail,
  CompetencyAnalysis
} from '../../types/sessions';

class SessionService {
  // Загрузка файлов
  async uploadFile(
    file: any, 
    options: UploadOptions
  ): Promise<MediaFile> {
    // Теперь мы работаем с реальными файлами, поэтому всегда пытаемся загрузить на сервер
    if (false) { // Отключаем мок-режим для реальных файлов
      // Возвращаем мок-данные для демонстрации
      return {
        id: Math.floor(Math.random() * 1000),
        originalName: file.name,
        fileName: file.name,
        filePath: file.uri || file.name,
        fileSize: file.size || 1024000,
        mimeType: file.type || 'audio/mpeg',
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        transcriptionEnabled: options.transcriptionEnabled,
        autoAnalysis: options.autoAnalysis,
        language: options.language || 'ru',
        quality: options.quality || 'high',
        isAnalyzed: false,
        analysisId: null,
        analysisResult: null,
        transcription: null,
        insights: null,
        competencies: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Создаем FormData для загрузки файла
    const formData = new FormData();
    
    // Добавляем файл в FormData для React Native
    // В React Native нужно использовать объект с uri, type и name
    let fileType = file.type || 'application/octet-stream';
    
    // Исправляем тип файла для лучшей совместимости
    // Используем правильные MIME-типы для каждого формата
    if (file.name) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'mp4':
        case 'mov':
        case 'avi':
          fileType = 'video/mp4';
          break;
        case 'mp3':
          fileType = 'audio/mp3'; // MP3 (сервер ожидает audio/mp3, а не audio/mpeg)
          break;
        case 'm4a':
          fileType = 'audio/m4a'; // M4A (AAC)
          break;
        case 'wav':
          fileType = 'audio/wav'; // WAV
          break;
        case 'jpg':
        case 'jpeg':
          fileType = 'image/jpeg';
          break;
        case 'png':
          fileType = 'image/png';
          break;
        default:
          // Если не удалось определить, используем тип из file.type или по умолчанию
          fileType = file.type || 'application/octet-stream';
      }
    }
    
    const fileData = {
      uri: file.uri,
      type: fileType,
      name: file.name || 'file',
    };
    
    console.log('Добавляем файл в FormData:', fileData);
    formData.append('file', fileData as any);
    
    // Добавляем опции загрузки
    formData.append('transcriptionEnabled', options.transcriptionEnabled.toString());
    formData.append('autoAnalysis', options.autoAnalysis.toString());
    
    if (options.language) formData.append('language', options.language);
    if (options.quality) formData.append('quality', options.quality);
    if (options.extractAudio) formData.append('extractAudio', options.extractAudio.toString());
    if (options.audioFormat) formData.append('audioFormat', options.audioFormat);
    if (options.isAudioExtract) formData.append('isAudioExtract', options.isAudioExtract.toString());
    if (options.originalFileName) formData.append('originalFileName', options.originalFileName);

    // Логируем данные FormData (без использования entries, так как это не поддерживается в React Native)
    console.log('FormData создан с файлом:', fileData);

    try {
      console.log('Загружаем файл:', {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri
      });
      
      // Проверяем, что у нас есть необходимые данные файла
      if (!file.uri && !file.name) {
        console.log('Недостаточно данных о файле');
        throw new Error('Недостаточно данных о файле');
      }
      
      // Проверяем подключение к серверу
      try {
        console.log('Проверяем подключение к серверу...');
        await apiService.get('/health');
        console.log('Сервер доступен');
      } catch (healthError) {
        console.log('Сервер недоступен, но продолжаем попытку загрузки');
      }
      
      // Пытаемся загрузить файл на сервер
      console.log('Отправляем запрос на сервер...');
      return await apiService.post<MediaFile>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 секунд таймаут
        transformRequest: [(data) => {
          // В React Native нужно использовать специальный transformRequest для FormData
          return data;
        }],
      });
    } catch (error) {
      console.error('Ошибка загрузки файла на сервер:', error);
      
      // Логируем детали ошибки
      if (error.response) {
        console.error('Ответ сервера:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Запрос не был отправлен:', error.request);
      } else {
        console.error('Ошибка настройки запроса:', error.message);
      }
      
      // Если сервер недоступен, возвращаем мок-данные
      console.log('Сервер недоступен, используем мок-данные');
      return {
        id: Math.floor(Math.random() * 1000),
        originalName: file.name,
        fileName: file.name,
        filePath: file.uri,
        fileSize: file.size || 0,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        transcriptionEnabled: options.transcriptionEnabled,
        autoAnalysis: options.autoAnalysis,
        language: options.language || 'ru',
        quality: options.quality || 'high',
        isAnalyzed: false,
        analysisId: null,
        analysisResult: null,
        transcription: null,
        insights: null,
        competencies: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Получение списка файлов пользователя
  async getUserFiles(): Promise<MediaFile[]> {
    return apiService.get<MediaFile[]>('/upload');
  }

  // Получение проанализированных файлов
  async getAnalyzedFiles(): Promise<MediaFile[]> {
    return apiService.get<MediaFile[]>('/analysis/analyzed');
  }

  // Получение неанализированных файлов
  async getUnanalyzedFiles(): Promise<MediaFile[]> {
    return apiService.get<MediaFile[]>('/analysis/unanalyzed');
  }

  // Получение файла по ID
  async getFileById(id: number): Promise<MediaFile> {
    return apiService.get<MediaFile>(`/upload/${id}`);
  }

  // Удаление файла
  async deleteFile(id: number): Promise<void> {
    return apiService.delete<void>(`/upload/${id}`);
  }

  // Получение транскрипции
  async getTranscription(fileId: number): Promise<{ transcription: string }> {
    return apiService.get<{ transcription: string }>(`/analysis/file/${fileId}/transcription`);
  }

  // Запуск анализа
  async startAnalysis(fileId: number): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/analysis/${fileId}/start`);
  }

  // Получение статуса анализа
  async getAnalysisStatus(fileId: number): Promise<SessionAnalysis> {
    return apiService.get<SessionAnalysis>(`/analysis/${fileId}/status`);
  }

  // Получение результатов анализа
  async getAnalysisResults(fileId: number): Promise<AnalysisResult> {
    return apiService.get<AnalysisResult>(`/analysis/${fileId}/results`);
  }

  // Получение анализа компетенций
  async getCompetencyAnalysis(fileId: number, sourceType: 'audio' | 'ai-session' = 'audio'): Promise<CompetencyAnalysis[]> {
    return apiService.get<CompetencyAnalysis[]>(`/analysis/file/${fileId}/competency-analysis?sourceType=${sourceType}`);
  }

  // Запуск анализа компетенций
  async startCompetencyAnalysis(fileId: number, criteria: string[]): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/analysis/${fileId}/competency/start`, { criteria });
  }

  // Получение статистики сессий
  async getSessionStats(): Promise<SessionStats> {
    return apiService.get<SessionStats>('/sessions/stats');
  }

  // Получение детальной информации о сессии
  async getSessionDetail(sessionId: number): Promise<SessionDetail> {
    console.log('🔍 SessionService: Getting session detail for ID:', sessionId);
    console.log('🔍 SessionService: Requesting URL:', `/upload/${sessionId}`);
    try {
      const result = await apiService.get<SessionDetail>(`/upload/${sessionId}`);
      console.log('✅ SessionService: Session detail received:', result);
      return result;
    } catch (error) {
      console.error('❌ SessionService: Error getting session detail:', error);
      throw error;
    }
  }

  // Создание новой сессии
  async createSession(data: CreateSessionData): Promise<SessionDetail> {
    return apiService.post<SessionDetail>('/sessions', data);
  }

  // Обновление сессии
  async updateSession(sessionId: number, data: Partial<CreateSessionData>): Promise<SessionDetail> {
    return apiService.put<SessionDetail>(`/sessions/${sessionId}`, data);
  }

  // Удаление сессии
  async deleteSession(sessionId: number): Promise<void> {
    return apiService.delete<void>(`/sessions/${sessionId}`);
  }

  // Получение сессий ментора
  async getMentorSessions(mentorId: number): Promise<MediaFile[]> {
    return apiService.get<MediaFile[]>(`/admin/mentors/${mentorId}/sessions`);
  }

  // Получение детальной информации о менторе
  async getMentorDetail(mentorId: number): Promise<any> {
    return apiService.get<any>(`/admin/mentors/${mentorId}`);
  }

  // Получение прогресса ментора
  async getMentorProgress(mentorId: number): Promise<any> {
    return apiService.get<any>(`/admin/mentors/${mentorId}/progress`);
  }

  // Получение статистики пользователя
  async getStats(): Promise<any> {
    return apiService.get<any>('/analytics/dashboard');
  }

  // Analytics API methods (соответствуют web версии)
  async getDashboardStats(organizationId?: number): Promise<any> {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return apiService.get<any>(`/analytics/dashboard${params}`);
  }

  async getMonthlyTrends(months: number = 6, organizationId?: number): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (organizationId) {
      params.append('organizationId', organizationId.toString());
    }
    return apiService.get<any[]>(`/analytics/trends?${params}`);
  }

  async getTopPerformers(limit: number = 5, organizationId?: number): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (organizationId) {
      params.append('organizationId', organizationId.toString());
    }
    return apiService.get<any[]>(`/analytics/top-performers?${params}`);
  }

  async getAnalyticsInsights(organizationId?: number): Promise<any[]> {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return apiService.get<any[]>(`/analytics/insights${params}`);
  }

  async getCriteriaAnalysis(organizationId?: number): Promise<any[]> {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return apiService.get<any[]>(`/analytics/criteria${params}`);
  }

  // Мониторинг прогресса загрузки/анализа
  async monitorUploadProgress(fileId: number): Promise<UploadProgress> {
    // Для демонстрации возвращаем мок-прогресс
    if (fileId < 1000) { // Предполагаем, что мок-файлы имеют ID < 1000
      return {
        fileId,
        status: 'completed',
        progress: 100,
        stage: 'Завершено',
        error: null,
        result: {
          transcription: 'Это демонстрационная транскрипция...',
          analysis: 'Демонстрационный анализ сессии',
          insights: ['Демонстрационное понимание', 'Демонстрационная коммуникация'],
          competencies: {
            communication: 85,
            leadership: 78,
            problemSolving: 92,
            teamwork: 88
          }
        }
      };
    }
    
    return apiService.get<UploadProgress>(`/upload/${fileId}/progress`);
  }

  // Получение рекомендаций на основе анализа
  async getRecommendations(fileId: number): Promise<string[]> {
    return apiService.get<string[]>(`/analysis/${fileId}/recommendations`);
  }

  // Экспорт результатов анализа
  async exportAnalysis(fileId: number, format: 'pdf' | 'json' | 'csv' = 'pdf'): Promise<Blob> {
    const response = await apiService.get(`/analysis/${fileId}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response;
  }

  // Получение истории анализов
  async getAnalysisHistory(limit: number = 10, offset: number = 0): Promise<MediaFile[]> {
    return apiService.get<MediaFile[]>(`/analysis/history?limit=${limit}&offset=${offset}`);
  }

  // Поиск сессий
  async searchSessions(query: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    scoreMin?: number;
    scoreMax?: number;
    status?: string;
  }): Promise<MediaFile[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.scoreMin) params.append('scoreMin', filters.scoreMin.toString());
    if (filters?.scoreMax) params.append('scoreMax', filters.scoreMax.toString());
    if (filters?.status) params.append('status', filters.status);

    return apiService.get<MediaFile[]>(`/sessions/search?${params.toString()}`);
  }

  // Получение аналитики по периодам
  async getAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    period: string;
    totalSessions: number;
    averageScore: number;
    scoreDistribution: { score: number; count: number }[];
    trends: { date: string; score: number; sessions: number }[];
  }> {
    return apiService.get<any>(`/analytics?period=${period}`);
  }

  // Получение ИИ-сессий тренажера
  async getAITrainerSessions(): Promise<any[]> {
    return apiService.get<any[]>('/analysis/ai-sessions');
  }

  // Запуск анализа (универсальный метод для файлов и ИИ-сессий, как в mentor-react)
  async startAnalysis(fileId?: number, sessionData?: any): Promise<{ message: string; analysisId: string }> {
    return apiService.post<{ message: string; analysisId: string }>('/analysis/start', {
      fileId,
      sessionData
    });
  }

  // Запуск анализа ИИ-сессии
  async startAITrainerAnalysis(sessionData: any): Promise<{ message: string; analysisId: string }> {
    return this.startAnalysis(undefined, sessionData);
  }

  // Получение статуса анализа (универсальный метод для файлов и ИИ-сессий, как в mentor-react)
  async getAnalysisStatus(analysisId: string): Promise<{
    status: string;
    progress: number;
    stage: string;
    data?: any;
  }> {
    return apiService.get<any>(`/analysis/${analysisId}/status`);
  }

  // Получение статуса анализа ИИ-сессии (алиас для обратной совместимости)
  async getAITrainerAnalysisStatus(analysisId: string): Promise<{
    status: string;
    progress: number;
    stage: string;
    data?: any;
  }> {
    return this.getAnalysisStatus(analysisId);
  }

  // Получение анализа компетенций для ИИ-сессии
  async getAITrainerCompetencyAnalysis(sessionId: number): Promise<CompetencyAnalysis[]> {
    return this.getCompetencyAnalysis(sessionId, 'ai-session');
  }

  // Анализ компетенций (как в mentor-react)
  async analyzeCompetency(
    prompt: string,
    mediaFileId: number,
    criterion: string,
    sourceType: 'audio' | 'ai-session' = 'audio'
  ): Promise<{
    competence: string;
    definition: string;
    markers: Array<{
      id: number;
      name: string;
      observed: boolean;
      explanation?: string;
    }>;
    overall_competence_observed: boolean;
  }> {
    return apiService.post<{
      competence: string;
      definition: string;
      markers: Array<{
        id: number;
        name: string;
        observed: boolean;
        explanation?: string;
      }>;
      overall_competence_observed: boolean;
    }>('/analysis/competency', {
      prompt,
      mediaFileId,
      criterion,
      sourceType,
    });
  }

  // Удаление анализа компетенций (как в mentor-react)
  async deleteCompetencyAnalysis(
    fileId: number,
    criterion: string,
    sourceType: 'audio' | 'ai-session' = 'audio'
  ): Promise<void> {
    return apiService.delete(`/analysis/file/${fileId}/competency-analysis/${criterion}?sourceType=${sourceType}`);
  }
}

export const sessionService = new SessionService();


