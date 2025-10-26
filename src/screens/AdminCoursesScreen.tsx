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
import { CreateCourseModal } from '../components/CreateCourseModal';

export const AdminCoursesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockCourses = [
        {
          id: 1,
          title: 'Основы менторства',
          description: 'Базовые принципы и техники менторства',
          status: 'published',
          difficulty: 'beginner',
          duration: 120,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
        },
        {
          id: 2,
          title: 'Продвинутые техники',
          description: 'Углубленные методы работы с менти',
          status: 'draft',
          difficulty: 'advanced',
          duration: 180,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
        },
      ];
      setCourses(mockCourses);
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

  const handleEditCourse = (courseId: number) => {
    navigation.navigate('EditCourse' as never, { courseId } as never);
  };

  const handleDeleteCourse = async (courseId: number) => {
    Alert.alert(
      'Удаление курса',
      'Вы уверены, что хотите удалить этот курс?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseService.deleteCourse(courseId);
              await loadCourses();
              Alert.alert('Успех', 'Курс удален');
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Ошибка', 'Не удалось удалить курс');
            }
          },
        },
      ]
    );
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      await courseService.createCourse(courseData);
      setShowCreateModal(false);
      await loadCourses();
      Alert.alert('Успех', 'Курс создан');
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Ошибка', 'Не удалось создать курс');
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return colors.success;
      case 'draft': return colors.warning;
      case 'archived': return colors.gray[500];
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликован';
      case 'draft': return 'Черновик';
      case 'archived': return 'Архив';
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
        <Text style={styles.headerTitle}>Управление курсами</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Создать курс</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>Всего курсов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {courses.filter(c => c.status === 'published').length}
            </Text>
            <Text style={styles.statLabel}>Опубликовано</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {courses.filter(c => c.status === 'draft').length}
            </Text>
            <Text style={styles.statLabel}>Черновики</Text>
          </View>
        </View>

        <View style={styles.coursesContainer}>
          {courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditCourse(course.id)}
                  >
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteCourse(course.id)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.courseDescription}>{course.description}</Text>
              
              <View style={styles.courseMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(course.status)}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
                  <Text style={styles.difficultyText}>{getDifficultyText(course.difficulty)}</Text>
                </View>
                <Text style={styles.durationText}>⏱️ {course.duration} мин</Text>
              </View>
              
              <Text style={styles.courseDate}>
                Создан: {new Date(course.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <CreateCourseModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  coursesContainer: {
    paddingHorizontal: spacing.lg,
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
  courseActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  actionButtonText: {
    fontSize: 16,
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
  courseDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
  },
});


