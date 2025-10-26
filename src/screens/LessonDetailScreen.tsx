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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { colors, spacing, typography } from '../styles';
import { lessonService } from '../services/api/lessonService';
import { testService } from '../services/api/testService';
import { assignmentService } from '../services/api/assignmentService';
import { Lesson } from '../types/lessons';
import { StructuredContentViewer } from '../components/StructuredContentViewer';

interface RouteParams {
  lessonId: number;
}

export const LessonDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { lessonId } = route.params as RouteParams;
  const { user } = useAppSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<any>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [lessonTests, setLessonTests] = useState<any[]>([]);
  const [lessonAssignments, setLessonAssignments] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      const lessonData = await lessonService.getLessonById(lessonId);
      setLesson(lessonData);
      
      // Инициализируем прогресс курса если нужно
      if (lessonData?.courseId) {
        try {
          await lessonService.initializeCourseProgress(lessonData.courseId);
          console.log('✅ Course progress initialized');
        } catch (error) {
          console.log('ℹ️ Course progress already exists or error:', error);
        }
      }
      
      // Загружаем прогресс урока
      try {
        const progressData = await lessonService.getLessonProgress(lessonId);
        setLessonProgress(progressData);
      } catch (error) {
        console.error('Error loading lesson progress:', error);
        // Устанавливаем значения по умолчанию если API не поддерживает прогресс
        setLessonProgress({
          status: 'not_started',
          progress: 0
        });
      }

      // Загружаем связанные тесты и задания
      await loadRelatedTestsAndAssignments(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить урок');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedTestsAndAssignments = async (lessonData: Lesson) => {
    if (!lessonData?.courseId) return;
    
    try {
      setRelatedLoading(true);
      console.log('📚 Loading related tests and assignments for lesson:', lessonId, 'course:', lessonData.courseId);
      
      // Загружаем тесты и задания курса параллельно
      const [testsData, assignmentsData] = await Promise.all([
        testService.getTests(lessonData.courseId),
        assignmentService.getCourseAssignments(lessonData.courseId)
      ]);
      
      // Фильтруем по lessonId
      const filteredTests = (testsData || []).filter((test: any) => test.lessonId === lessonId);
      const filteredAssignments = (assignmentsData || []).filter((assignment: any) => assignment.lessonId === lessonId);
      
      console.log('📚 Filtered tests for lesson', lessonId, ':', filteredTests);
      console.log('📚 Filtered assignments for lesson', lessonId, ':', filteredAssignments);
      
      setLessonTests(filteredTests);
      setLessonAssignments(filteredAssignments);
    } catch (error) {
      console.error('Error loading related tests and assignments:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLesson();
    setRefreshing(false);
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'analysis': return 'Анализ';
      case 'question-answer': return 'Вопрос-ответ';
      case 'ai-trainer': return 'AI-тренер';
      case 'ai-session-trainer': return 'AI-сессия';
      case 'practical': return 'Практическое';
      case 'test': return 'Тест';
      default: return type;
    }
  };


  const handleCompleteLesson = async () => {
    try {
      await lessonService.completeLesson(lessonId);
      Alert.alert('Успех', 'Урок завершен!');
      await loadLesson();
    } catch (error) {
      console.error('Error completing lesson:', error);
      // Обновляем локальное состояние
      setLessonProgress(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
      }));
      Alert.alert('Успех', 'Урок завершен!');
    }
  };

  // Функция для обновления прогресса урока
  const updateLessonProgress = async (progress: number) => {
    if (isUpdatingProgress) return;
    
    try {
      setIsUpdatingProgress(true);
      await lessonService.updateLessonProgress(lessonId, progress);
      
      // Обновляем локальное состояние
      setLessonProgress(prev => ({
        ...prev,
        progress: progress,
        status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
      }));
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'not_started': return colors.gray[500];
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'in_progress': return 'В процессе';
      case 'not_started': return 'Не начат';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Начальный';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка урока...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Урок не найден</Text>
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

  const currentStatus = lessonProgress?.status || 'not_started';
  const currentProgress = lessonProgress?.progress || 0;

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
        <Text style={styles.headerTitle}>Урок</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(currentStatus)}</Text>
          </View>
        </View>
        
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
        
        <View style={styles.lessonMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(lesson.difficulty)}</Text>
          </View>
          <Text style={styles.durationText}>⏱️ {lesson.duration} мин</Text>
          <Text style={styles.lessonType}>📚 {lesson.type}</Text>
        </View>

        {currentStatus === 'in_progress' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Прогресс урока</Text>
            <Text style={styles.progressText}>{currentProgress}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${currentProgress}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {currentStatus === 'in_progress' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteLesson}
          >
            <Text style={styles.completeButtonText}>Завершить урок</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contentContainer}>
          <StructuredContentViewer 
            content={lesson.content}
            contentFormatted={lesson.contentFormatted}
            onLessonLinkClick={(lessonId) => {
              // Навигация к другому уроку
              navigation.navigate('LessonDetail', { lessonId });
            }}
            onTestLinkClick={(testId) => {
              navigation.navigate('TestDetail' as never, { testId } as never);
            }}
            onAssignmentLinkClick={(assignmentId) => {
              navigation.navigate('AssignmentDetail' as never, { assignmentId } as never);
            }}
            style={styles.contentText}
          />
        </View>

        {/* Связанные тесты и задания */}
        <View style={styles.relatedContainer}>
          <Text style={styles.relatedTitle}>Связанные активности:</Text>
          
          {relatedLoading ? (
            <Text style={styles.relatedLoadingText}>Загрузка...</Text>
          ) : (
            <View style={styles.relatedContent}>
              {/* Тесты */}
              <View style={styles.relatedSection}>
                <Text style={styles.relatedSectionTitle}>Тесты ({lessonTests.length})</Text>
                {lessonTests.length > 0 ? (
                  <View style={styles.relatedItems}>
                    {lessonTests.map((test) => (
                      <View key={test.id} style={styles.testItem}>
                        <View style={styles.testInfo}>
                          <Text style={styles.testTitle}>{test.title}</Text>
                          <Text style={styles.testDetails}>
                            {test.duration} мин • {test.passingScore}% проходной балл
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.testButton}
                          onPress={() => {
                            navigation.navigate('TestDetail' as never, { testId: test.id } as never);
                          }}
                        >
                          <Text style={styles.testButtonText}>Пройти тест</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.relatedEmptyText}>Нет тестов, привязанных к этому уроку</Text>
                )}
              </View>

              {/* Задания */}
              <View style={styles.relatedSection}>
                <Text style={styles.relatedSectionTitle}>Домашние задания ({lessonAssignments.length})</Text>
                {lessonAssignments.length > 0 ? (
                  <View style={styles.relatedItems}>
                    {lessonAssignments.map((assignment) => (
                      <View key={assignment.id} style={styles.assignmentItem}>
                        <View style={styles.assignmentInfo}>
                          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                          <Text style={styles.assignmentDetails}>
                            {getTypeText(assignment.type)} • 
                            {assignment.estimatedHours ? `${assignment.estimatedHours} ч` : 'Без ограничений по времени'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.assignmentButton}
                          onPress={() => {
                            navigation.navigate('AssignmentDetail' as never, { assignmentId: assignment.id, courseId: lesson?.courseId } as never);
                          }}
                        >
                          <Text style={styles.assignmentButtonText}>Выполнить</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.relatedEmptyText}>Нет заданий, привязанных к этому уроку</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <View style={styles.objectivesContainer}>
            <Text style={styles.objectivesTitle}>Цели обучения</Text>
            {lesson.learningObjectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Text style={styles.objectiveBullet}>•</Text>
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        )}

        {lesson.prerequisites && lesson.prerequisites.length > 0 && (
          <View style={styles.prerequisitesContainer}>
            <Text style={styles.prerequisitesTitle}>Предварительные требования</Text>
            {lesson.prerequisites.map((prerequisite, index) => (
              <View key={index} style={styles.prerequisiteItem}>
                <Text style={styles.prerequisiteBullet}>•</Text>
                <Text style={styles.prerequisiteText}>{prerequisite}</Text>
              </View>
            ))}
          </View>
        )}
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
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  lessonTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
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
  lessonDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  difficultyText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  durationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  lessonType: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  progressContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  contentContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  contentTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  contentText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 20,
  },
  objectivesContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  objectivesTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  objectiveBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  objectiveText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  prerequisitesContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  prerequisitesTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  prerequisiteBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.warning,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  prerequisiteText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  relatedContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  relatedTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  relatedLoadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
  },
  relatedContent: {
    gap: spacing.md,
  },
  relatedSection: {
    gap: spacing.sm,
  },
  relatedSectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  relatedItems: {
    gap: spacing.sm,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.blue[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.blue[900],
    marginBottom: spacing.xs,
  },
  testDetails: {
    fontSize: typography.fontSizes.xs,
    color: colors.blue[600],
  },
  testButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.blue[300],
  },
  testButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.blue[700],
    fontWeight: typography.fontWeights.medium,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.green[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.green[900],
    marginBottom: spacing.xs,
  },
  assignmentDetails: {
    fontSize: typography.fontSizes.xs,
    color: colors.green[600],
  },
  assignmentButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.green[300],
  },
  assignmentButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.green[700],
    fontWeight: typography.fontWeights.medium,
  },
  relatedEmptyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
});


