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
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { colors, spacing, typography } from '../styles';
import { assignmentService } from '../services/api/assignmentService';
import { CourseAssignment, CourseAssignmentType } from '../types/assignments';
import { FormattedText } from '../components/FormattedText';
import { AnalysisAssignmentModal } from '../components/AnalysisAssignmentModal';
import { QuestionAnswerAssignmentModal } from '../components/QuestionAnswerAssignmentModal';
import { AITrainerAssignmentModal } from '../components/AITrainerAssignmentModal';
import { AISessionTrainerModal } from '../components/AISessionTrainerModal';
import { AssignmentAIReviewModal } from '../components/AssignmentAIReviewModal';

interface RouteParams {
  assignmentId: number;
  courseId?: number;
}

export const AssignmentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { assignmentId, courseId } = route.params as RouteParams;
  const { user } = useAppSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showQuestionAnswerModal, setShowQuestionAnswerModal] = useState(false);
  const [showAITrainerModal, setShowAITrainerModal] = useState(false);
  const [showAISessionTrainerModal, setShowAISessionTrainerModal] = useState(false);
  const [aiReviewResults, setAiReviewResults] = useState<any>(null);
  const [showAIReviewModal, setShowAIReviewModal] = useState(false);

  const loadAssignment = async () => {
    try {
      setIsLoading(true);
      
      // Если courseId указан, используем getCourseAssignment
      if (courseId) {
        const assignmentData = await assignmentService.getCourseAssignment(courseId, assignmentId);
        
        // Загружаем дополнительные данные для заданий типа "Вопрос-ответ"
        if (assignmentData.type === 'question_answer') {
          try {
            const questionAnswerData = await assignmentService.getQuestionAnswerData(courseId, assignmentId);
            setAssignment({
              ...assignmentData,
              questionAnswerData
            });
          } catch (error) {
            console.error('Error loading question-answer data:', error);
            setAssignment(assignmentData);
          }
        } else {
          setAssignment(assignmentData);
        }
      } else {
        // Иначе используем getAssignmentById для загрузки задания ментора
        const assignmentData = await assignmentService.getAssignmentById(assignmentId);
        setAssignment(assignmentData);
      }
      
      // Загружаем статус отправки
      try {
        const status = await assignmentService.getCourseAssignmentSubmissionStatus(assignmentId);
        if (status && status.hasSubmission) {
          setSubmissionStatus(status);
          setSubmissionContent(status.content || '');
        }
      } catch (error) {
        console.error('Error loading submission status:', error);
      }

      // Загружаем результаты ИИ если задание выполнено
      try {
        const aiResults = await assignmentService.getAssignmentAIReview(assignmentId);
        if (aiResults && aiResults.length > 0 && aiResults[0]) {
          setAiReviewResults(aiResults[0]);
        } else {
          setAiReviewResults(null);
        }
      } catch (error) {
        console.error('Error loading AI review results:', error);
        // Не показываем ошибку пользователю, просто не загружаем результаты ИИ
        setAiReviewResults(null);
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задание');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignment();
    setRefreshing(false);
  };

  const handleSubmitAssignment = async () => {
    if (!submissionContent.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ответ на задание');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Используем разные методы в зависимости от типа задания
      if (assignment?.type === 'analysis') {
        await assignmentService.submitAnalysisAssignment(assignmentId, {
          content: submissionContent,
        });
      } else if (assignment?.type === 'question-answer') {
        await assignmentService.submitQuestionAnswerAssignment(assignmentId, {
          content: submissionContent,
        });
      } else if (assignment?.type === 'ai-trainer') {
        await assignmentService.submitAITrainerAssignment(assignmentId, {
          content: submissionContent,
        });
      } else if (assignment?.type === 'ai_session_trainer') {
        await assignmentService.submitAISessionTrainerAssignment(assignmentId, {
          content: submissionContent,
        });
      } else {
        // Обычное задание
        await assignmentService.submitAssignment(assignmentId, {
          content: submissionContent,
        });
      }
      
      Alert.alert('Успех', 'Задание отправлено на проверку!');
      await loadAssignment();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAssignment = () => {
    if (!assignment) return;
    
    switch (assignment.type) {
      case CourseAssignmentType.ANALYSIS:
        setShowAnalysisModal(true);
        break;
      case CourseAssignmentType.QUESTION_ANSWER:
        setShowQuestionAnswerModal(true);
        break;
      case CourseAssignmentType.AI_TRAINER:
        setShowAITrainerModal(true);
        break;
      case CourseAssignmentType.AI_SESSION_TRAINER:
        setShowAISessionTrainerModal(true);
        break;
      default:
        // Для обычных заданий показываем форму ввода
        break;
    }
  };

  const handleAnalysisSubmit = async (answers: any[]) => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      await assignmentService.submitAnalysisAssignment(assignment.id, answers);
      Alert.alert('Успешно', 'Аналитическое задание отправлено');
      setShowAnalysisModal(false);
      loadAssignment();
    } catch (error) {
      console.error('Error submitting analysis assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionAnswerSubmit = async (answers: any[]) => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      
      // Формируем структурированный ответ
      const structuredAnswer = assignment.questionAnswerData?.questions?.map((question, index) => {
        const answer = answers.find(a => a.questionId === (question.id || index));
        return `Вопрос ${index + 1}: ${question.question}\n\nОтвет: ${answer?.value || ''}\n\n`;
      }).join('---\n\n') || '';

      await assignmentService.submitQuestionAnswerAssignment(assignment.id, {
        content: structuredAnswer,
        attachments: []
      });
      Alert.alert('Успешно', 'Задание отправлено');
      setShowQuestionAnswerModal(false);
      loadAssignment();
    } catch (error) {
      console.error('Error submitting question-answer assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAITrainerSubmit = async (data: any) => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      await assignmentService.submitAITrainerAssignment(assignment.id, data);
      Alert.alert('Успешно', 'ИИ-тренажёр завершён');
      setShowAITrainerModal(false);
      loadAssignment();
    } catch (error) {
      console.error('Error submitting AI trainer assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISessionTrainerSubmit = async (data: any) => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      await assignmentService.submitAISessionTrainerAssignment(assignment.id, data);
      Alert.alert('Успешно', 'AI-тренажёр сессии завершён');
      setShowAISessionTrainerModal(false);
      loadAssignment();
    } catch (error) {
      console.error('Error submitting AI session trainer assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAIReview = async () => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      await assignmentService.reviewAssignmentWithAI(assignment.id);
      Alert.alert('Успешно', 'Анализ ИИ запущен. Результаты будут доступны через несколько минут.');
      // Перезагружаем задание, чтобы получить результаты
      await loadAssignment();
    } catch (error) {
      console.error('Error starting AI review:', error);
      Alert.alert('Ошибка', 'Не удалось запустить анализ ИИ');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      case 'overdue': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В процессе';
      case 'pending': return 'Ожидает';
      case 'overdue': return 'Просрочено';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return '📊';
      case 'question-answer': return '❓';
      case 'ai-trainer': return '🤖';
      case 'ai_session_trainer': return '🎯';
      case 'practical': return '💼';
      case 'test': return '📝';
      default: return '📋';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'analysis': return 'Анализ';
      case 'question-answer': return 'Вопрос-ответ';
      case 'ai-trainer': return 'AI-тренер';
      case 'ai_session_trainer': return 'AI-сессия';
      case 'practical': return 'Практическое';
      case 'test': return 'Тест';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray[500];
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка задания...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Задание не найдено</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
  const currentStatus = isOverdue ? 'overdue' : assignment.status;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Задание</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentTitleContainer}>
            <Text style={styles.assignmentIcon}>{getTypeIcon(assignment.type)}</Text>
            <View style={styles.assignmentInfo}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <Text style={styles.assignmentType}>{getTypeText(assignment.type)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(currentStatus)}</Text>
          </View>
        </View>
        
        <Text style={styles.assignmentDescription}>{assignment.description}</Text>
        
        <View style={styles.assignmentMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityText(assignment.priority)}</Text>
          </View>
          <Text style={styles.dueDateText}>
            📅 {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
          </Text>
          {assignment.estimatedHours && (
            <Text style={styles.estimatedHoursText}>
              ⏱️ {assignment.estimatedHours}ч
            </Text>
          )}
        </View>

        {assignment.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Инструкции</Text>
            <FormattedText 
              html={assignment.instructions} 
              style={styles.instructionsText}
            />
          </View>
        )}

        {assignment.expectedOutcome && (
          <View style={styles.outcomeContainer}>
            <Text style={styles.outcomeTitle}>Ожидаемый результат</Text>
            <FormattedText 
              html={assignment.expectedOutcome} 
              style={styles.outcomeText}
            />
          </View>
        )}

        {(assignment.status === 'pending' || assignment.status === 'draft' || assignment.status === 'published') && (
          <View style={styles.submissionContainer}>
            <Text style={styles.submissionTitle}>Выполнение задания</Text>
            
            {/* Кнопки для разных типов заданий */}
            {assignment?.type === CourseAssignmentType.ANALYSIS && (
              <View style={styles.assignmentTypeContainer}>
                <Text style={styles.assignmentTypeDescription}>
                  Это аналитическое задание. Нажмите кнопку ниже, чтобы начать выполнение.
                </Text>
                <TouchableOpacity
                  style={styles.startAssignmentButton}
                  onPress={() => setShowAnalysisModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.startAssignmentButtonText}>
                    {isSubmitting ? 'Выполнение...' : 'Выполнить аналитическое задание'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {assignment?.type === CourseAssignmentType.QUESTION_ANSWER && (
              <View style={styles.assignmentTypeContainer}>
                <Text style={styles.assignmentTypeDescription}>
                  Это задание типа "Вопрос-ответ". Нажмите кнопку ниже, чтобы начать выполнение.
                </Text>
                <TouchableOpacity
                  style={styles.startAssignmentButton}
                  onPress={() => setShowQuestionAnswerModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.startAssignmentButtonText}>
                    {isSubmitting ? 'Выполнение...' : 'Ответить на вопросы'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {assignment?.type === CourseAssignmentType.AI_TRAINER && (
              <View style={styles.assignmentTypeContainer}>
                <Text style={styles.assignmentTypeDescription}>
                  Это задание ИИ-тренажёра. Нажмите кнопку ниже, чтобы запустить диалог с ИИ-ментором.
                </Text>
                <TouchableOpacity
                  style={styles.startAssignmentButton}
                  onPress={() => setShowAITrainerModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.startAssignmentButtonText}>
                    {isSubmitting ? 'Запуск...' : 'Запустить ИИ-тренажёр'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {assignment?.type === CourseAssignmentType.AI_SESSION_TRAINER && (
              <View style={styles.assignmentTypeContainer}>
                <Text style={styles.assignmentTypeDescription}>
                  Это задание AI-тренажёра сессии. Нажмите кнопку ниже, чтобы запустить структурированную сессию с AI-ментором.
                </Text>
                <TouchableOpacity
                  style={styles.startAssignmentButton}
                  onPress={() => setShowAISessionTrainerModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.startAssignmentButtonText}>
                    {isSubmitting ? 'Запуск...' : 'Запустить AI-тренажёр сессии'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Обычное задание с текстовым вводом */}
            {assignment?.type !== CourseAssignmentType.ANALYSIS && 
             assignment?.type !== CourseAssignmentType.QUESTION_ANSWER && 
             assignment?.type !== CourseAssignmentType.AI_TRAINER && 
             assignment?.type !== CourseAssignmentType.AI_SESSION_TRAINER && (
              <>
                <TextInput
                  style={styles.submissionInput}
                  value={submissionContent}
                  onChangeText={setSubmissionContent}
                  placeholder="Введите ваш ответ на задание..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmitAssignment}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Отправка...' : 'Отправить задание'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {submissionStatus && (
          <View style={styles.submissionStatusContainer}>
            <Text style={styles.submissionStatusTitle}>Статус отправки</Text>
            <View style={styles.submissionStatusContent}>
              <Text style={styles.submissionStatusText}>
                Отправлено: {new Date(submissionStatus.submittedAt).toLocaleDateString('ru-RU')}
              </Text>
              {submissionStatus.score && (
                <Text style={styles.submissionScoreText}>
                  Оценка: {submissionStatus.score}/100
                </Text>
              )}
              {submissionStatus.feedback && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackTitle}>Обратная связь:</Text>
                  <FormattedText 
                    html={submissionStatus.feedback} 
                    style={styles.feedbackText}
                  />
                </View>
              )}
              
              {/* Кнопка для просмотра результатов ИИ */}
              {aiReviewResults ? (
                <TouchableOpacity
                  style={styles.aiReviewButton}
                  onPress={() => setShowAIReviewModal(true)}
                >
                  <Text style={styles.aiReviewButtonText}>Посмотреть анализ ИИ</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.aiReviewButton}
                  onPress={handleStartAIReview}
                >
                  <Text style={styles.aiReviewButtonText}>Запустить анализ ИИ</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Модальные окна для разных типов заданий */}
      <AnalysisAssignmentModal
        visible={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onSubmit={handleAnalysisSubmit}
        assignment={assignment!}
        questions={assignment?.analysisQuestions || []}
        resultType={assignment?.analysisResultType || 'text'}
        analysisTitle={assignment?.title}
      />

      <QuestionAnswerAssignmentModal
        visible={showQuestionAnswerModal}
        onClose={() => setShowQuestionAnswerModal(false)}
        onSubmit={handleQuestionAnswerSubmit}
        assignment={assignment!}
      />

      <AITrainerAssignmentModal
        visible={showAITrainerModal}
        onClose={() => setShowAITrainerModal(false)}
        onSubmit={handleAITrainerSubmit}
        assignment={assignment!}
      />

      <AISessionTrainerModal
        isOpen={showAISessionTrainerModal}
        onClose={() => setShowAISessionTrainerModal(false)}
        assignment={assignment!}
        courseId={courseId}
        onSubmissionSuccess={() => {
          setShowAISessionTrainerModal(false);
          loadAssignment();
        }}
      />

      {/* Модальное окно с результатами ИИ */}
      <AssignmentAIReviewModal
        visible={showAIReviewModal}
        onClose={() => setShowAIReviewModal(false)}
        review={aiReviewResults}
        assignment={assignment}
      />
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
    color: colors.text,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  assignmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  assignmentIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  assignmentType: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  assignmentDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  dueDateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  estimatedHoursText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  instructionsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 20,
  },
  outcomeContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  outcomeTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  outcomeText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 20,
  },
  submissionContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  submissionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  submissionInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  submissionStatusContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  submissionStatusTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  submissionStatusContent: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  submissionStatusText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  submissionScoreText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
  },
  feedbackContainer: {
    marginTop: spacing.sm,
  },
  feedbackTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    lineHeight: 20,
  },
  assignmentTypeContainer: {
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
  assignmentTypeDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  startAssignmentButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  startAssignmentButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  aiReviewButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  aiReviewButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});
