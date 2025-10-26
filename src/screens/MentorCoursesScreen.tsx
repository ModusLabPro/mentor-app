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
import { courseService } from '../services/api/courseService';
import { Course } from '../types/courses';

export const MentorCoursesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить курсы');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCoursePress = (courseId: number) => {
    navigation.navigate('CourseDetail' as never, { courseId } as never);
  };

  const handleStartCourse = async (courseId: number) => {
    try {
      await courseService.startCourse(courseId);
      // Переходим к детальному просмотру курса
      navigation.navigate('CourseDetail' as never, { courseId } as never);
    } catch (error) {
      console.error('Error starting course:', error);
      Alert.alert('Ошибка', 'Не удалось начать курс');
    }
  };

  const handleContinueCourse = (courseId: number) => {
    navigation.navigate('CourseDetail' as never, { courseId } as never);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    // Получаем прогресс курса для определения статуса
    const courseProgress = course.courseProgress?.[0];
    const courseStatus = courseProgress?.status || 'not_started';
    
    switch (filter) {
      case 'in_progress': return courseStatus === 'in_progress';
      case 'completed': return courseStatus === 'completed';
      case 'not_started': return courseStatus === 'not_started';
      default: return true;
    }
  });

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
          <Text style={styles.loadingText}>Загрузка курсов...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои курсы</Text>
        <Text style={styles.headerSubtitle}>
          {filteredCourses.length} из {courses.length} курсов
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Все' },
            { key: 'in_progress', label: 'В процессе' },
            { key: 'completed', label: 'Завершенные' },
            { key: 'not_started', label: 'Не начатые' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                filter === filterOption.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterOption.key && styles.filterButtonTextActive,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.coursesContainer}>
          {filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => handleCoursePress(course.id)}
            >
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(course.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.courseDescription}>{course.description}</Text>
              
              <View style={styles.courseMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
                  <Text style={styles.difficultyText}>{getDifficultyText(course.difficulty)}</Text>
                </View>
                <Text style={styles.durationText}>⏱️ {course.duration} мин</Text>
                <Text style={styles.instructorText}>👨‍🏫 {course.instructor}</Text>
              </View>

              {(() => {
                const courseProgress = course.courseProgress?.[0];
                const courseStatus = courseProgress?.status || 'not_started';
                const progress = courseProgress?.progress || 0;

                if (courseStatus === 'in_progress') {
                  return (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>Прогресс: {progress}%</Text>
                        <TouchableOpacity
                          style={styles.continueButton}
                          onPress={() => handleContinueCourse(course.id)}
                        >
                          <Text style={styles.continueButtonText}>Продолжить</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${progress}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                }

                if (courseStatus === 'not_started') {
                  return (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleStartCourse(course.id)}
                    >
                      <Text style={styles.startButtonText}>Начать курс</Text>
                    </TouchableOpacity>
                  );
                }

                return null;
              })()}

              <View style={styles.courseStats}>
                <Text style={styles.ratingText}>⭐ {course.rating}</Text>
                <Text style={styles.studentsText}>👥 {course.studentsCount} студентов</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    fontWeight: typography.fontWeights.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  coursesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  courseTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
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
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  instructorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
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
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  startButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  studentsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
});
