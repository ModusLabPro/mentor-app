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
import { assignmentService } from '../services/api/assignmentService';
import { CourseAssignment } from '../types/assignments';

export const MentorAssignmentsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const assignmentsData = await assignmentService.getMyAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задания');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  };

  const handleAssignmentPress = (assignmentId: number) => {
    navigation.navigate('AssignmentDetail' as never, { assignmentId } as never);
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    try {
      // TODO: Navigate to assignment submission screen
      Alert.alert('Информация', 'Функция отправки задания будет реализована в следующей версии');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now && assignment.status !== 'completed';
    
    switch (filter) {
      case 'pending': return assignment.status === 'pending';
      case 'completed': return assignment.status === 'completed';
      case 'overdue': return isOverdue;
      default: return true;
    }
  });

  const getStatusColor = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < now && status !== 'completed';
    
    if (isOverdue) return colors.error;
    
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.warning;
      case 'in_progress': return colors.primary;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < now && status !== 'completed';
    
    if (isOverdue) return 'Просрочено';
    
    switch (status) {
      case 'completed': return 'Завершено';
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В процессе';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return '📊';
      case 'question-answer': return '❓';
      case 'ai-trainer': return '🤖';
      case 'ai-session-trainer': return '🎯';
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
      case 'ai-session-trainer': return 'AI-сессия';
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
          <Text style={styles.loadingText}>Загрузка заданий...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои задания</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAssignments.length} из {assignments.length} заданий
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'Ожидающие' },
            { key: 'completed', label: 'Завершенные' },
            { key: 'overdue', label: 'Просроченные' },
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
        <View style={styles.assignmentsContainer}>
          {filteredAssignments.map((assignment) => (
            <TouchableOpacity
              key={assignment.id}
              style={styles.assignmentCard}
              onPress={() => handleAssignmentPress(assignment.id)}
            >
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentTitleContainer}>
                  <Text style={styles.assignmentIcon}>{getTypeIcon(assignment.type)}</Text>
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentType}>{getTypeText(assignment.type)}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status, assignment.dueDate) }]}>
                  <Text style={styles.statusText}>{getStatusText(assignment.status, assignment.dueDate)}</Text>
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

              {assignment.status === 'pending' && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleSubmitAssignment(assignment.id)}
                >
                  <Text style={styles.submitButtonText}>Выполнить задание</Text>
                </TouchableOpacity>
              )}

              {assignment.status === 'completed' && (
                <View style={styles.completedContainer}>
                  <Text style={styles.completedText}>✅ Задание выполнено</Text>
                  {assignment.score && (
                    <Text style={styles.scoreText}>Оценка: {assignment.score}/100</Text>
                  )}
                </View>
              )}
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
  assignmentsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  assignmentCard: {
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
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
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  completedContainer: {
    backgroundColor: colors.success + '20',
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: typography.fontSizes.md,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  scoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
});


