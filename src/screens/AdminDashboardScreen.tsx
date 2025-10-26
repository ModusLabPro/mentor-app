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
import { Course } from '../types/courses';
import { CourseAssignment } from '../types/assignments';
import { LearningMaterial } from '../types/learning-materials';
import { Logo } from '../components/Logo';

export const AdminDashboardScreen = () => {
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    totalMaterials: 0,
    activeUsers: 0,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      const mockCourses = [
        { id: 1, title: 'Основы менторства', status: 'published', difficulty: 'beginner', duration: 120 },
        { id: 2, title: 'Продвинутые техники', status: 'draft', difficulty: 'advanced', duration: 180 },
      ];
      const mockAssignments = [
        { id: 1, title: 'Практическое задание 1', type: 'practical', status: 'active', priority: 'high' },
        { id: 2, title: 'Теоретический тест', type: 'test', status: 'active', priority: 'medium' },
      ];
      const mockMaterials = [
        { id: 1, title: 'Руководство по менторству', type: 'document', status: 'published', difficulty: 'beginner' },
        { id: 2, title: 'Видео-лекция', type: 'video', status: 'published', difficulty: 'intermediate' },
      ];

      setCourses(mockCourses);
      setAssignments(mockAssignments);
      setLearningMaterials(mockMaterials);
      setStats({
        totalCourses: mockCourses.length,
        totalAssignments: mockAssignments.length,
        totalMaterials: mockMaterials.length,
        activeUsers: 25,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const statsData = [
    { title: 'Курсы', value: stats.totalCourses, color: colors.primary },
    { title: 'Задания', value: stats.totalAssignments, color: colors.secondary },
    { title: 'Материалы', value: stats.totalMaterials, color: colors.accent },
    { title: 'Пользователи', value: stats.activeUsers, color: colors.info },
  ];

  const quickActions = [
    { title: 'Создать курс', icon: '📚', color: colors.primary },
    { title: 'Управление', icon: '⚙️', color: colors.secondary },
    { title: 'Аналитика', icon: '📊', color: colors.accent },
    { title: 'Пользователи', icon: '👥', color: colors.info },
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
                  Добро пожаловать, {user?.firstName || 'Администратор'}! 👋
                </Text>
                <Text style={styles.subtitle}>Панель администратора</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Статистика системы</Text>
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
                style={[styles.actionCard, { backgroundColor: action.color + '20' }]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Последняя активность</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              Создан новый курс "Продвинутые техники менторства"
            </Text>
            <Text style={styles.activityTime}>2 часа назад</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              Зарегистрирован новый пользователь
            </Text>
            <Text style={styles.activityTime}>4 часа назад</Text>
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
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  statsContainer: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  actionsContainer: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  recentContainer: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  activityCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
  },
});


