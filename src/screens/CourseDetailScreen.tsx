import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles';
import { courseService } from '../services/api/courseService';
import { lessonService } from '../services/api/lessonService';
import { assignmentService } from '../services/api/assignmentService';
import { Course } from '../types/courses';
import { Lesson } from '../types/lessons';
import { CourseAssignment } from '../types/assignments';
import { stripAllHtml } from '../utils/htmlUtils';

export const CourseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: number };
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'assignments'>('overview');

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseData, lessonsData, assignmentsData] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessons(courseId),
        assignmentService.getCourseAssignments(courseId),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading course data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные курса');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourseData();
    setRefreshing(false);
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Начальный';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return difficulty;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликован';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.warning;
      case 'archived':
        return colors.gray[400];
      default:
        return colors.gray[400];
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Course Info */}
        <View style={styles.courseInfo}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) }]}>
              <Text style={styles.statusText}>{getStatusText(course.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.courseDescription}>{course.description}</Text>
          
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Сложность:</Text>
              <Text style={styles.metaValue}>{getDifficultyText(course.difficulty)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Длительность:</Text>
              <Text style={styles.metaValue}>{course.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Уроков:</Text>
              <Text style={styles.metaValue}>{lessons.length}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Заданий:</Text>
              <Text style={styles.metaValue}>{assignments.length}</Text>
            </View>
          </View>

          {course.tags && course.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {course.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Обзор
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
            onPress={() => setActiveTab('lessons')}
          >
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
              Уроки ({lessons.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
            onPress={() => setActiveTab('assignments')}
          >
            <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
              Задания ({assignments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {course.content && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Содержание курса</Text>
                <ScrollView style={styles.contentScrollView} nestedScrollEnabled>
                  <Text style={styles.contentText}>
                    {course.content ? stripAllHtml(course.content) : 'Содержание не указано'}
                  </Text>
                </ScrollView>
              </View>
            )}

            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Цели обучения</Text>
                {course.learningObjectives.map((objective, index) => (
                  <View key={index} style={styles.objectiveItem}>
                    <Text style={styles.objectiveBullet}>•</Text>
                    <Text style={styles.objectiveText}>{objective}</Text>
                  </View>
                ))}
              </View>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Предварительные требования</Text>
                {course.prerequisites.map((prerequisite, index) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <Text style={styles.prerequisiteBullet}>•</Text>
                    <Text style={styles.prerequisiteText}>{prerequisite}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'lessons' && (
          <View style={styles.tabContent}>
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDuration}>{lesson.duration} мин</Text>
                  </View>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  <View style={styles.lessonMeta}>
                    <Text style={styles.lessonType}>{lesson.type}</Text>
                    <Text style={styles.lessonStatus}>{lesson.status}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Уроки не найдены</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Добавить урок</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'assignments' && (
          <View style={styles.tabContent}>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <TouchableOpacity key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentType}>{assignment.type}</Text>
                  </View>
                  <Text style={styles.assignmentDescription}>{assignment.description}</Text>
                  <View style={styles.assignmentMeta}>
                    <Text style={styles.assignmentPriority}>Приоритет: {assignment.priority}</Text>
                    <Text style={styles.assignmentScore}>Макс. балл: {assignment.maxScore}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Задания не найдены</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Добавить задание</Text>
                </TouchableOpacity>
              </View>
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: 4,
    backgroundColor: colors.gray[100],
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
  },
  content: {
    flex: 1,
  },
  courseInfo: {
    padding: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  courseDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  metaValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    flex: 1,
    padding: spacing.md,
  },
  contentSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contentScrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
  },
  contentText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  objectiveBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  objectiveText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  prerequisiteBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.warning,
    marginRight: spacing.sm,
  },
  prerequisiteText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  lessonCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  lessonTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  lessonDuration: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  lessonDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonType: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  lessonStatus: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  assignmentCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  assignmentTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  assignmentType: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  assignmentDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assignmentPriority: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  assignmentScore: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});
