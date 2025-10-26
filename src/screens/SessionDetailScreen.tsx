import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { sessionService } from '../services/api';
import { SessionDetail, AnalysisResult } from '../types/sessions';

interface SessionDetailScreenProps {
  route: {
    params: {
      sessionId: number;
    };
  };
  navigation: any;
}

export const SessionDetailScreen = ({ route, navigation }: SessionDetailScreenProps) => {
  const { sessionId } = route.params;
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    loadSessionDetail();
  }, [sessionId]);

  const loadSessionDetail = async () => {
    try {
      setIsLoading(true);
      const sessionData = await sessionService.getSessionDetail(sessionId);
      setSession(sessionData);

      // Загружаем данные анализа если они есть
      if (sessionData.analysisData) {
        try {
          const analysis = JSON.parse(sessionData.analysisData);
          setAnalysisData(analysis);
        } catch (error) {
          console.error('Error parsing analysis data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading session detail:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали сессии');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!session) return;

    try {
      setIsLoadingAnalysis(true);
      await sessionService.startAnalysis(session.id);
      Alert.alert('Анализ запущен', 'Анализ будет выполнен в фоновом режиме');
      loadSessionDetail(); // Обновляем данные
    } catch (error) {
      console.error('Error starting analysis:', error);
      Alert.alert('Ошибка', 'Не удалось запустить анализ');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleShare = async () => {
    if (!session) return;

    try {
      const shareContent = {
        title: `Сессия: ${session.title}`,
        message: `Сессия с ${session.mentorName}\nОценка: ${session.score}/10\nДата: ${new Date(session.date).toLocaleDateString('ru-RU')}`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing session:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors.success;
    if (score >= 6) return colors.warning;
    return colors.error;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка сессии...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Сессия не найдена</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView style={styles.scrollContainer}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.subtitle}>
            {session.mentorName} • {new Date(session.date).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        {/* Основная информация */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о сессии</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Длительность</Text>
              <Text style={styles.infoValue}>{formatDuration(session.duration)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Статус</Text>
              <Text style={[styles.infoValue, { color: getScoreColor(session.score) }]}>
                {session.status === 'completed' ? 'Завершена' : 
                 session.status === 'in_progress' ? 'В процессе' : 'Запланирована'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Оценка</Text>
              <Text style={[styles.infoValue, { color: getScoreColor(session.score) }]}>
                {session.score}/10
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ментор</Text>
              <Text style={styles.infoValue}>{session.mentorName}</Text>
            </View>
          </View>
        </View>

        {/* Анализ */}
        {analysisData ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Результаты анализа</Text>
            
            {/* Общая оценка */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreTitle}>Общая оценка</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(analysisData.overallScore) }]}>
                {analysisData.overallScore}/10
              </Text>
            </View>

            {/* Структурное соответствие */}
            <View style={styles.analysisSection}>
              <Text style={styles.analysisTitle}>Структурное соответствие</Text>
              <View style={styles.metricsList}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Ясность целей</Text>
                  <Text style={styles.metricValue}>{analysisData.structureCompliance.goalClarity}/10</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Качество вопросов</Text>
                  <Text style={styles.metricValue}>{analysisData.structureCompliance.questionQuality}/10</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Обратная связь</Text>
                  <Text style={styles.metricValue}>{analysisData.structureCompliance.feedbackProvision}/10</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Планирование действий</Text>
                  <Text style={styles.metricValue}>{analysisData.structureCompliance.actionPlanning}/10</Text>
                </View>
              </View>
            </View>

            {/* Ключевые инсайты */}
            {analysisData.keyInsights && analysisData.keyInsights.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Ключевые инсайты</Text>
                {analysisData.keyInsights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightBullet}>•</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Рекомендации */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Рекомендации</Text>
                {analysisData.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationIcon}>💡</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Сильные стороны */}
            {analysisData.strengths && analysisData.strengths.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Сильные стороны</Text>
                {analysisData.strengths.map((strength, index) => (
                  <View key={index} style={styles.strengthItem}>
                    <Text style={styles.strengthIcon}>✅</Text>
                    <Text style={styles.strengthText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Области для улучшения */}
            {analysisData.areasForImprovement && analysisData.areasForImprovement.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Области для улучшения</Text>
                {analysisData.areasForImprovement.map((area, index) => (
                  <View key={index} style={styles.improvementItem}>
                    <Text style={styles.improvementIcon}>🎯</Text>
                    <Text style={styles.improvementText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Анализ</Text>
            <View style={styles.noAnalysisContainer}>
              <Text style={styles.noAnalysisText}>Анализ еще не выполнен</Text>
              <TouchableOpacity 
                style={styles.startAnalysisButton}
                onPress={handleStartAnalysis}
                disabled={isLoadingAnalysis}
              >
                {isLoadingAnalysis ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.startAnalysisText}>Запустить анализ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Транскрипция */}
        {session.transcription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Транскрипция</Text>
            <Text style={styles.transcriptionText}>{session.transcription}</Text>
          </View>
        )}

        {/* Заметки */}
        {session.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Заметки</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}

        {/* Рекомендация */}
        {session.recommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Рекомендация</Text>
            <Text style={styles.recommendationText}>{session.recommendation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Кнопка поделиться */}
      <View style={styles.shareButtonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Поделиться</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: typography.fontSizes.lg,
    color: colors.text,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.error,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  analysisSection: {
    marginBottom: spacing.lg,
  },
  analysisTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  metricsList: {
    gap: spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  metricLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  metricValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  insightBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  insightText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  strengthIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  strengthText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  improvementIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  improvementText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  noAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noAnalysisText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  startAnalysisButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startAnalysisText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  transcriptionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 24,
  },
  notesText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 24,
  },
  shareButtonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});




