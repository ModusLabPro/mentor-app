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

interface AssignmentAIReviewModalProps {
  visible: boolean;
  onClose: () => void;
  review: any;
  assignment: any;
}

export const AssignmentAIReviewModal: React.FC<AssignmentAIReviewModalProps> = ({
  visible,
  onClose,
  review,
  assignment
}) => {
  if (!review || !visible) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'pending': return 'В процессе';
      case 'failed': return 'Ошибка';
      default: return status;
    }
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
          <Text style={styles.headerTitle}>Анализ ИИ по заданию</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Информация о задании */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Информация о задании</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Название:</Text>
                <Text style={styles.infoValue}>{assignment?.title}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Описание:</Text>
                <Text style={styles.infoValue}>{assignment?.description}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Тип:</Text>
                <Text style={styles.infoValue}>
                  {assignment?.type === 'analysis' ? 'Аналитическое задание' :
                   assignment?.type === 'question_answer' ? 'Вопрос-ответ' :
                   assignment?.type === 'ai_trainer' ? 'ИИ-тренажёр' :
                   assignment?.type === 'ai_session_trainer' ? 'AI-тренажёр сессии' :
                   'Обычное задание'}
                </Text>
              </View>
            </View>
          </View>

          {/* Статус анализа */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Статус анализа</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(review.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(review.status) }]}>
                  {getStatusText(review.status)}
                </Text>
              </View>
              <Text style={styles.statusDate}>
                {review.createdAt ? formatDate(review.createdAt) : ''}
              </Text>
            </View>
          </View>

          {/* Обратная связь ИИ */}
          {review && review.aiFeedback && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Обратная связь ИИ</Text>
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>{review.aiFeedback}</Text>
              </View>
            </View>
          )}

          {/* Детальный анализ ИИ */}
          {review && review.aiAnalysis && review.aiAnalysis !== null && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Детальный анализ ИИ</Text>
              <View style={styles.analysisGrid}>
                {review.aiAnalysis.overallScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.primary }]}>
                      {review.aiAnalysis.overallScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Общая оценка</Text>
                  </View>
                )}
                {review.aiAnalysis.qualityScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.success }]}>
                      {review.aiAnalysis.qualityScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Качество ответа</Text>
                  </View>
                )}
                {review.aiAnalysis.completenessScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.warning }]}>
                      {review.aiAnalysis.completenessScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Полнота ответа</Text>
                  </View>
                )}
                {review.aiAnalysis.creativityScore && (
                  <View style={[styles.scoreCard, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.scoreValue, { color: colors.secondary }]}>
                      {review.aiAnalysis.creativityScore}/10
                    </Text>
                    <Text style={styles.scoreLabel}>Креативность</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Предложения ИИ */}
          {review && review.aiAnalysis && review.aiAnalysis !== null && review.aiAnalysis.suggestions && review.aiAnalysis.suggestions.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Предложения ИИ</Text>
              <View style={styles.suggestionsContainer}>
                {review.aiAnalysis.suggestions.map((suggestion: string, index: number) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.suggestionBullet}>•</Text>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Проблемы ИИ */}
          {review && review.aiAnalysis && review.aiAnalysis !== null && review.aiAnalysis.issues && review.aiAnalysis.issues.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Выявленные проблемы</Text>
              <View style={styles.issuesContainer}>
                {review.aiAnalysis.issues.map((issue: string, index: number) => (
                  <View key={index} style={styles.issueItem}>
                    <Text style={styles.issueBullet}>⚠️</Text>
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Оценка администратора */}
          {review && review.adminScore && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Оценка администратора</Text>
              <View style={styles.adminScoreContainer}>
                <Text style={styles.adminScoreValue}>{review.adminScore}/10</Text>
                {review.adminFeedback && (
                  <Text style={styles.adminFeedbackText}>{review.adminFeedback}</Text>
                )}
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
  adminScoreContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  adminScoreValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  adminFeedbackText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    textAlign: 'center',
  },
});


