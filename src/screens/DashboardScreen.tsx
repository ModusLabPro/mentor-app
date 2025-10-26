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
} from 'react-native';
import { useAppSelector } from '../store/hooks';
import { colors, spacing, typography } from '../styles';
import { courseService } from '../services/api/courseService';
import { assignmentService } from '../services/api/assignmentService';
import { learningMaterialService } from '../services/api/learningMaterialService';
import { sessionService } from '../services/api/sessionService';
import { Course } from '../types/courses';
import { CourseAssignment } from '../types/assignments';
import { LearningMaterial } from '../types/learning-materials';
import { SessionStats } from '../types/sessions';
import { Logo } from '../components/Logo';

export const DashboardScreen = () => {
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [stats, setStats] = useState({
    activeCourses: 0,
    completedAssignments: 0,
    inProgress: 0,
    averageScore: 0,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coursesData, assignmentsData, materialsData, sessionStatsData] = await Promise.all([
        courseService.getMyCourses(),
        assignmentService.getMyAssignments(),
        learningMaterialService.getMyLearningMaterials(),
        sessionService.getSessionStats(),
      ]);

      setCourses(coursesData);
      setAssignments(assignmentsData);
      setLearningMaterials(materialsData);
      setSessionStats(sessionStatsData);

      // Вычисляем статистику
      const activeCourses = coursesData.filter(course => course.status === 'published').length;
      const completedAssignments = assignmentsData.filter(assignment => 
        assignment.submissions.some(sub => sub.status === 'approved')
      ).length;
      const inProgress = assignmentsData.filter(assignment => 
        assignment.submissions.some(sub => sub.status === 'submitted')
      ).length;
      
      const averageScore = assignmentsData.length > 0 
        ? assignmentsData.reduce((sum, assignment) => {
            const scores = assignment.submissions
              .filter(sub => sub.score !== undefined)
              .map(sub => sub.score!);
            return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
          }, 0) / assignmentsData.length
        : 0;

      setStats({
        activeCourses,
        completedAssignments,
        inProgress,
        averageScore: Math.round(averageScore * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const statsData = [
    { title: 'Активные курсы', value: stats.activeCourses.toString(), color: colors.primary },
    { title: 'Завершенные задания', value: stats.completedAssignments.toString(), color: colors.success },
    { title: 'В процессе', value: stats.inProgress.toString(), color: colors.warning },
    { title: 'Средняя оценка', value: stats.averageScore.toString(), color: colors.accent },
  ];

  const quickActions = [
    { title: 'Мои курсы', icon: '📚', color: colors.primary },
    { title: 'Задания', icon: '📝', color: colors.secondary },
    { title: 'Обучение', icon: '🎓', color: colors.accent },
    { title: 'Профиль', icon: '👤', color: colors.info },
  ];

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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Logo size={32} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Привет, {user?.firstName || 'Пользователь'}! 👋
              </Text>
              <Text style={styles.subtitle}>Добро пожаловать в Mentor AI</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderColor: action.color }]}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Статистика сессий */}
      {sessionStats && (
        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>Мои сессии</Text>
          <View style={styles.sessionsStats}>
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatNumber}>{sessionStats.totalSessions}</Text>
              <Text style={styles.sessionStatLabel}>Всего сессий</Text>
            </View>
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatNumber}>{sessionStats.analyzedSessions}</Text>
              <Text style={styles.sessionStatLabel}>Проанализировано</Text>
            </View>
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatNumber}>{sessionStats.averageScore?.toFixed(1) || '0'}</Text>
              <Text style={styles.sessionStatLabel}>Средняя оценка</Text>
            </View>
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatNumber}>{sessionStats.totalDuration}</Text>
              <Text style={styles.sessionStatLabel}>Минут всего</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Недавняя активность</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            Завершено задание "Основы менторства"
          </Text>
          <Text style={styles.activityTime}>2 часа назад</Text>
        </View>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            Начато изучение курса "Продвинутые техники"
          </Text>
          <Text style={styles.activityTime}>1 день назад</Text>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  statsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  actionsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  recentContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  activityCard: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  activityText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
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
  sessionsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sessionsStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sessionStatItem: {
    width: '48%',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  sessionStatNumber: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  sessionStatLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
