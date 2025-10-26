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
import { courseService } from '../services/api/courseService';
import { lessonService } from '../services/api/lessonService';
import { Course } from '../types/courses';
import { Lesson } from '../types/lessons';
import { StructuredContentViewer } from '../components/StructuredContentViewer';

interface RouteParams {
  courseId: number;
}

export const MentorCourseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as RouteParams;
  const { user } = useAppSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      
      // Загружаем уроки курса
      const lessonsData = await lessonService.getLessons(courseId);
      setLessons(lessonsData);
      
      // Загружаем прогресс курса
      try {
        const progressData = await courseService.getCourseProgress(courseId);
        if (progressData && progressData.length > 0) {
          setCourseProgress(progressData[0]);
        }
      } catch (error) {
        console.error('Error loading course progress:', error);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить курс');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourse();
    setRefreshing(false);
  };

  const handleStartCourse = async () => {
    try {
      await courseService.startCourse(courseId);
      Alert.alert('Успех', 'Курс начат!');
      await loadCourse();
    } catch (error) {
      console.error('Error starting course:', error);
      Alert.alert('Ошибка', 'Не удалось начать курс');
    }
  };

  const handleLessonPress = (lessonId: number) => {
    navigation.navigate('LessonDetail' as never, { lessonId } as never);
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

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
          <Text style={styles.loadingText}>Загрузка курса...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Курс не найден</Text>
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

  const currentStatus = courseProgress?.status || 'not_started';
  const currentProgress = courseProgress?.progress || 0;

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
        <Text style={styles.headerTitle}>Курс</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(currentStatus)}</Text>
          </View>
        </View>
        
        <Text style={styles.courseDescription}>{course.description}</Text>
        
        <View style={styles.courseMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(course.difficulty)}</Text>
          </View>
          <Text style={styles.durationText}>⏱️ {course.duration} мин</Text>
          <Text style={styles.lessonsCount}>📚 {lessons.length} уроков</Text>
        </View>

        {currentStatus === 'in_progress' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Прогресс курса</Text>
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

        {currentStatus === 'not_started' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartCourse}
          >
            <Text style={styles.startButtonText}>Начать курс</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contentContainer}>
          <StructuredContentViewer 
            content={course.content}
            contentFormatted={course.contentFormatted}
            onLessonLinkClick={(lessonId) => {
              // Навигация к уроку
              navigation.navigate('LessonDetail', { lessonId });
            }}
            onTestLinkClick={(testId) => {
              // Навигация к тесту
              Alert.alert('Тест', `Переход к тесту ${testId}`);
            }}
            onAssignmentLinkClick={(assignmentId) => {
              // Навигация к заданию
              Alert.alert('Задание', `Переход к заданию ${assignmentId}`);
            }}
            style={styles.contentText}
          />
        </View>

        <View style={styles.lessonsContainer}>
          <Text style={styles.lessonsTitle}>Уроки курса</Text>
          {lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonNumber}>{index + 1}</Text>
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>
                </View>
                <Text style={styles.lessonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Дополнительные материалы</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CourseAssignments' as never, { courseId } as never)}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionIcon}>📝</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Задания курса</Text>
                <Text style={styles.actionDescription}>Выполните практические задания</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CourseTests' as never, { courseId } as never)}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionIcon}>🧪</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Тесты курса</Text>
                <Text style={styles.actionDescription}>Проверьте свои знания</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </View>
          </TouchableOpacity>
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  courseTitle: {
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
  courseDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  courseMeta: {
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
  lessonsCount: {
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
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  startButtonText: {
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
  lessonsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  lessonsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  lessonCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumber: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginRight: spacing.sm,
    minWidth: 24,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lessonDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  lessonArrow: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[400],
  },
  actionsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  actionsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  actionArrow: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[400],
  },
});
