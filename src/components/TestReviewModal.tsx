import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { Test, TestReview } from '../types/tests';

interface TestReviewModalProps {
  visible: boolean;
  onClose: () => void;
  test: Test | null;
  review: TestReview | null;
}

export const TestReviewModal: React.FC<TestReviewModalProps> = ({
  visible,
  onClose,
  test,
  review,
}) => {
  if (!test) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'needs_revision': return colors.warning;
      case 'pending': return colors.primary;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      case 'needs_revision': return 'Требует доработки';
      case 'pending': return 'На проверке';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'needs_revision': return '⚠️';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Отзыв AI по тесту</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Основная информация о тесте */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Информация о тесте</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Название:</Text>
                <Text style={styles.infoValue}>{test.title}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Описание:</Text>
                <Text style={styles.infoValue}>{test.description}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Длительность:</Text>
                <Text style={styles.infoValue}>{test.duration} минут</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Проходной балл:</Text>
                <Text style={styles.infoValue}>{test.passingScore}%</Text>
              </View>
            </View>
          </View>

          {/* Сообщение если результаты ИИ ещё не загружены */}
          {!review && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Анализ ИИ</Text>
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Результаты анализа ИИ ещё не готовы. Пожалуйста, подождите немного и попробуйте снова.
                </Text>
              </View>
            </View>
          )}

          {/* Статус проверки */}
          {review && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Статус проверки</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusIcon}>{getStatusIcon(review.status)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(review.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(review.status) }]}>
                    {getStatusText(review.status)}
                  </Text>
                </View>
                <Text style={styles.statusDate}>
                  {formatDate(review.createdAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Обратная связь AI */}
          {review && review.aiFeedback && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Обратная связь AI</Text>
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>{review.aiFeedback}</Text>
              </View>
            </View>
          )}

          {/* Детальный анализ AI */}
          {review && review.aiAnalysis && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Детальный анализ AI</Text>
              <View style={styles.analysisGrid}>
                <View style={[styles.scoreCard, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>
                    {review.aiAnalysis.overallScore}/10
                  </Text>
                  <Text style={styles.scoreLabel}>Общая оценка</Text>
                </View>
                <View style={[styles.scoreCard, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.scoreValue, { color: colors.success }]}>
                    {review.aiAnalysis.questionQuality}/10
                  </Text>
                  <Text style={styles.scoreLabel}>Качество вопросов</Text>
                </View>
                <View style={[styles.scoreCard, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.scoreValue, { color: colors.warning }]}>
                    {review.aiAnalysis.difficultyLevel}/10
                  </Text>
                  <Text style={styles.scoreLabel}>Сложность</Text>
                </View>
                <View style={[styles.scoreCard, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.scoreValue, { color: colors.error }]}>
                    {review.aiAnalysis.coverageScore}/10
                  </Text>
                  <Text style={styles.scoreLabel}>Покрытие</Text>
                </View>
                {review.aiAnalysis.technicalScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.secondary }]}>
                      {review.aiAnalysis.technicalScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Техническая оценка</Text>
                  </View>
                )}
                {review.aiAnalysis.effectivenessScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.primary }]}>
                      {review.aiAnalysis.effectivenessScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Эффективность</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Предложения AI */}
          {review.aiAnalysis?.suggestions && review.aiAnalysis.suggestions.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Предложения AI</Text>
              <View style={styles.suggestionsContainer}>
                {review.aiAnalysis.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.suggestionBullet}>•</Text>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Проблемы AI */}
          {review.aiAnalysis?.issues && review.aiAnalysis.issues.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Выявленные проблемы</Text>
              <View style={styles.issuesContainer}>
                {review.aiAnalysis.issues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Text style={styles.issueBullet}>⚠️</Text>
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Проблемные вопросы */}
          {review.aiAnalysis?.problematicQuestions && review.aiAnalysis.problematicQuestions.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Проблемные вопросы</Text>
              <View style={styles.problematicQuestionsContainer}>
                {review.aiAnalysis.problematicQuestions.map((question, index) => (
                  <View key={index} style={styles.problematicQuestionItem}>
                    <Text style={styles.problematicQuestionText}>{question}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Обратная связь администратора */}
          {review && review.adminFeedback && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Обратная связь администратора</Text>
              <View style={styles.adminFeedbackContainer}>
                <Text style={styles.adminFeedbackText}>{review.adminFeedback}</Text>
              </View>
            </View>
          )}

          {/* Оценка администратора */}
          {review && review.adminScore && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Оценка администратора</Text>
              <View style={styles.adminScoreContainer}>
                <Text style={styles.adminScoreValue}>{review.adminScore}/10</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSizes.xl,
    color: colors.gray[700],
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: typography.fontSizes.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  statusDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  feedbackContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  feedbackText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scoreCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  scoreLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[600],
    textAlign: 'center',
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  suggestionBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.success,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  issuesContainer: {
    gap: spacing.sm,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  issueBullet: {
    fontSize: typography.fontSizes.md,
    marginTop: 2,
  },
  issueText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  problematicQuestionsContainer: {
    gap: spacing.sm,
  },
  problematicQuestionItem: {
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    padding: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  problematicQuestionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  adminFeedbackContainer: {
    backgroundColor: colors.secondary + '10',
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  adminFeedbackText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  adminScoreContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  adminScoreValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
  },
  loadingContainer: {
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
});
