import { apiService } from './apiService';
import { UserProfile, UpdateProfileData, Achievement, Activity, ProfileStats } from '../../types/profile';

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/auth/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/auth/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      // Пока возвращаем моковые данные, позже заменим на реальный API
      return [
        {
          title: "100 сессий",
          description: "Провели больше 100 менторских сессий",
          icon: "🎯",
          earned: true,
          date: "15 мая 2025"
        },
        {
          title: "Отличный ментор",
          description: "Средняя оценка сессий выше 8.5",
          icon: "⭐",
          earned: true,
          date: "20 апреля 2025"
        },
        {
          title: "Эксперт аналитики",
          description: "Использовали все функции аналитики",
          icon: "📊",
          earned: true,
          date: "3 марта 2025"
        },
        {
          title: "Мастер интеграций",
          description: "Настроили 5+ интеграций",
          icon: "🔗",
          earned: false,
          date: undefined
        }
      ];
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  }

  async getActivities(): Promise<Activity[]> {
    try {
      // Пока возвращаем моковые данные, позже заменим на реальный API
      return [
        {
          date: "Сегодня, 14:30",
          action: "Проанализирована сессия с Анной К.",
          score: 9.2
        },
        {
          date: "Вчера, 16:45",
          action: "Загружена новая сессия",
          score: undefined
        },
        {
          date: "2 дня назад",
          action: "Экспортирован отчет по аналитике",
          score: undefined
        },
        {
          date: "3 дня назад",
          action: "Настроена интеграция с Telegram",
          score: undefined
        }
      ];
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  }

  async getProfileStats(): Promise<ProfileStats> {
    try {
      // Пока возвращаем моковые данные, позже заменим на реальный API
      return {
        completedCourses: 15,
        completedAssignments: 32,
        averageScore: 4.8,
        totalSessions: 45
      };
    } catch (error) {
      console.error('Get profile stats error:', error);
      throw error;
    }
  }

  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      // Пока возвращаем моковый URL, позже заменим на реальный API
      return imageUri;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();

