import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { colors, spacing, typography } from '../styles';
import { sessionService } from '../services/api/sessionService';
import { Logo } from '../components/Logo';

interface MediaFile {
  id: number;
  originalName: string;
  createdAt: string;
  analysisData?: string;
  analysisDuration?: number;
}

interface AnalysisResult {
  overallScore: number;
  recommendations: string[];
  structureCompliance?: {
    mentorAdvice?: { status: string; proof: string };
  };
}

interface MentorStats {
  assignments: {
    total: number;
    completed: number;
    pending: number;
    averageScore: number;
    recent: number;
  };
  learning: {
    total: number;
    completed: number;
    averageProgress: number;
    recent: number;
  };
  sessions: {
    total: number;
    averageScore: number;
  };
  growth: {
    percent: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface RecentSession {
  id: number;
  title: string;
  score: number;
  date: string;
  dateOnly: string;
  timeOnly: string;
  recommendation: string;
  mentorAdvice?: string;
}

export const MentorDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [totalAnalysisMinutes, setTotalAnalysisMinutes] = useState(0);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      console.log('Loading mentor dashboard data...');
      
      // Загружаем сессии и статистику параллельно
      const [sessionsData, statsData] = await Promise.allSettled([
        sessionService.getAnalyzedFiles(),
        sessionService.getStats()
      ]);

      // Обрабатываем результаты
      const sessions = sessionsData.status === 'fulfilled' ? sessionsData.value : [];
      const stats = statsData.status === 'fulfilled' ? statsData.value : null;
      
      // Логируем ошибки если есть
      if (sessionsData.status === 'rejected') {
        console.error('Error loading sessions:', sessionsData.reason);
        console.error('Sessions API error details:', {
          status: sessionsData.reason?.response?.status,
          data: sessionsData.reason?.response?.data,
          message: sessionsData.reason?.message
        });
      }
      if (statsData.status === 'rejected') {
        console.error('Error loading stats:', statsData.reason);
        console.error('Stats API error details:', {
          status: statsData.reason?.response?.status,
          data: statsData.reason?.response?.data,
          message: statsData.reason?.message
        });
      }
      
      console.log('Sessions loaded:', sessions.length);
      console.log('Sessions data:', sessions);
      console.log('Stats loaded:', stats);
      console.log('Stats structure:', {
        assignments: stats?.assignments,
        learning: stats?.learning,
        sessions: stats?.sessions,
        growth: stats?.growth
      });

      // Обрабатываем сессии
      const processedSessions: RecentSession[] = sessions.slice(0, 3).map((file: MediaFile) => {
        let score = 0;
        let recommendation = "Нет рекомендации";
        let mentorAdvice = undefined;
        let dateObj = new Date(file.createdAt);
        let dateOnly = dateObj.toLocaleString("ru-RU", { day: "numeric", month: "long" });
        let timeOnly = dateObj.toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        
        if (file.analysisData) {
          try {
            const data: AnalysisResult = JSON.parse(file.analysisData);
            score = data.overallScore;
            recommendation = data.recommendations?.[0] || "Нет рекомендации";
            mentorAdvice = data.structureCompliance?.mentorAdvice?.proof;
          } catch (error) {
            console.error('Error parsing analysis data:', error);
          }
        }
        
        return {
          id: file.id,
          title: file.originalName,
          score,
          date: dateObj.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
          dateOnly,
          timeOnly,
          recommendation,
          mentorAdvice
        };
      });

      setRecentSessions(processedSessions);

      // Устанавливаем статистику
      setStats(stats);

      // Вычисляем общее время анализа
      const totalSeconds = sessions.reduce((sum, file) => sum + (file.analysisDuration || 0), 0);
      setTotalAnalysisMinutes(Math.round(totalSeconds / 60));

    } catch (error) {
      console.error('Error loading mentor data:', error);
      // Не показываем Alert для ошибок API, просто логируем
      console.log('Continuing with empty data...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUploadClick = () => {
    navigation.navigate('Upload' as never);
  };

  const handleAnalyticsClick = () => {
    navigation.navigate('Analytics' as never);
  };

  const handleNewSessionClick = () => {
    navigation.navigate('Upload' as never);
  };

  const handleChecklistClick = () => {
    console.log('Создать чек-лист');
  };

  const handleExportClick = () => {
    console.log('Экспорт отчета');
  };

  const handleSettingsClick = () => {
    console.log('Настройки анализа');
  };

  const handleSessionClick = (sessionId: number) => {
    navigation.navigate('Analysis' as never, { sessionId } as never);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Logo size={32} />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeTitle}>Добро пожаловать в Mentor AI</Text>
                <Text style={styles.welcomeSubtitle}>
                  Платформа для анализа и оценки менторских сессий с использованием ИИ
                </Text>
              </View>
            </View>
            <View style={styles.welcomeActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleUploadClick}>
                <Text style={styles.primaryButtonText}>📤 Загрузить новую сессию</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleAnalyticsClick}>
                <Text style={styles.secondaryButtonText}>📊 Посмотреть аналитику</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>🎥</Text>
                </View>
                <Text style={styles.statBadge}>
                  {stats ? `${stats.sessions.total} сессий` : 'Загрузка...'}
                </Text>
              </View>
              <Text style={styles.statValue}>{stats?.sessions?.total || 0}</Text>
              <Text style={styles.statLabel}>Всего сессий</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>🎯</Text>
                </View>
                <Text style={styles.statBadge}>
                  {stats ? `${stats.assignments?.completed || 0} выполнено` : 'Загрузка...'}
                </Text>
              </View>
              <Text style={styles.statValue}>{stats?.assignments?.total || 0}</Text>
              <Text style={styles.statLabel}>Заданий</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>⭐</Text>
                </View>
                <Text style={styles.statBadge}>
                  {stats ? `${stats.sessions?.averageScore || 0} баллов` : 'Загрузка...'}
                </Text>
              </View>
              <Text style={styles.statValue}>{stats?.sessions?.averageScore || 0}</Text>
              <Text style={styles.statLabel}>Средний балл</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>📚</Text>
                </View>
                <Text style={styles.statBadge}>
                  {stats ? `${stats.learning?.completed || 0} изучено` : 'Загрузка...'}
                </Text>
              </View>
              <Text style={styles.statValue}>{stats?.learning?.total || 0}</Text>
              <Text style={styles.statLabel}>Материалов</Text>
            </View>
          </View>
        </View>

        {/* Recent Sessions and Progress */}
        <View style={styles.contentContainer}>
          {/* Recent Sessions */}
          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionTitle}>Последние сессии</Text>
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <TouchableOpacity 
                  key={session.id} 
                  style={styles.sessionCard}
                  onPress={() => handleSessionClick(session.id)}
                >
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <View style={styles.sessionTags}>
                      <View style={styles.recommendationTag}>
                        <Text style={styles.recommendationText}>
                          Рекомендация: {session.recommendation}
                        </Text>
                      </View>
                      {session.mentorAdvice && (
                        <View style={styles.adviceTag}>
                          <Text style={styles.adviceText}>
                            Совет ментора: {session.mentorAdvice}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.sessionScore}>
                    <Text style={styles.sessionScoreValue}>{session.score}/10</Text>
                    <Text style={styles.sessionDate}>{session.dateOnly}</Text>
                    <Text style={styles.sessionTime}>{session.timeOnly}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Нет загруженных сессий</Text>
                <Text style={styles.emptyStateSubtext}>Загрузите первую сессию для анализа</Text>
              </View>
            )}
          </View>

          {/* Progress Overview */}
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Прогресс оценки</Text>
            <View style={styles.progressItems}>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Обсуждение прогресса</Text>
                  <Text style={styles.progressValue}>85%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '85%' }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Прояснение цели</Text>
                  <Text style={styles.progressValue}>92%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '92%' }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Поиск решения</Text>
                  <Text style={styles.progressValue}>78%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '78%' }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Подведение итогов</Text>
                  <Text style={styles.progressValue}>88%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '88%' }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Быстрые действия</Text>
            <View style={styles.actionsList}>
              <TouchableOpacity style={styles.actionButton} onPress={handleNewSessionClick}>
                <Text style={styles.actionButtonText}>🎥 Новая сессия</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonOutline} onPress={handleChecklistClick}>
                <Text style={styles.actionButtonOutlineText}>📋 Создать чек-лист</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonGhost} onPress={handleExportClick}>
                <Text style={styles.actionButtonGhostText}>📊 Экспорт отчета</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonGhost} onPress={handleSettingsClick}>
                <Text style={styles.actionButtonGhostText}>⚙️ Настройки анализа</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  welcomeSection: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 10,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  welcomeText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.white,
    opacity: 0.9,
  },
  welcomeActions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 24,
  },
  statBadge: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  sessionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sessionTags: {
    gap: spacing.xs,
  },
  recommendationTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  recommendationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  adviceTag: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  adviceText: {
    fontSize: typography.fontSizes.xs,
    color: colors.accent,
    fontWeight: typography.fontWeights.semibold,
  },
  sessionScore: {
    alignItems: 'flex-end',
  },
  sessionScoreValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  sessionTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  progressContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
  },
  progressItems: {
    gap: spacing.md,
  },
  progressItem: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  progressValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  actionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionsList: {
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonOutlineText: {
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  actionButtonGhost: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  actionButtonGhostText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});