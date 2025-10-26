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
import { colors, spacing, typography } from '../styles';
import { assignmentService } from '../services/api/assignmentService';
import { CourseAssignment, CourseAssignmentType } from '../types/assignments';
import { AISessionTrainerModal, CreateAssignmentModal } from '../components';

export const AssignmentsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [showAISessionModal, setShowAISessionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const assignmentsData = await assignmentService.getMyAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликовано';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: CourseAssignmentType) => {
    switch (type) {
      case CourseAssignmentType.ANALYSIS:
        return '📊';
      case CourseAssignmentType.QUESTION_ANSWER:
        return '❓';
      case CourseAssignmentType.AI_TRAINER:
        return '🤖';
      case CourseAssignmentType.AI_SESSION_TRAINER:
        return '💬';
      default:
        return '📋';
    }
  };

  const getTypeText = (type: CourseAssignmentType) => {
    switch (type) {
      case CourseAssignmentType.ANALYSIS:
        return 'Анализ';
      case CourseAssignmentType.QUESTION_ANSWER:
        return 'Вопрос-Ответ';
      case CourseAssignmentType.AI_TRAINER:
        return 'AI Тренер';
      case CourseAssignmentType.AI_SESSION_TRAINER:
        return 'AI Сессия';
      default:
        return type;
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
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.title}>Задания</Text>
        <Text style={styles.subtitle}>Выполняйте задания для развития навыков</Text>
      </View>

      {assignments.map((assignment) => (
        <TouchableOpacity 
          key={assignment.id} 
          style={styles.assignmentCard}
          onPress={() => {
            if (assignment.type === CourseAssignmentType.AI_SESSION_TRAINER) {
              setSelectedAssignment(assignment);
              setShowAISessionModal(true);
            }
          }}
        >
          <View style={styles.assignmentHeader}>
            <View style={styles.typeContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon(assignment.type)}</Text>
              <Text style={styles.typeText}>{getTypeText(assignment.type)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
              <Text style={styles.statusText}>{getStatusText(assignment.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <Text style={styles.assignmentDescription}>{assignment.description}</Text>
          
          <View style={styles.assignmentMeta}>
            <Text style={styles.priority}>Приоритет: {assignment.priority}</Text>
            <Text style={styles.maxScore}>Макс. балл: {assignment.maxScore}</Text>
          </View>
          
          {assignment.dueDate && (
            <Text style={styles.dueDate}>Срок: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}</Text>
          )}
          
          {assignment.tags && assignment.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {assignment.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.addButtonText}>+ Создать задание</Text>
      </TouchableOpacity>

      {/* AI Session Trainer Modal */}
      {selectedAssignment && (
        <AISessionTrainerModal
          isOpen={showAISessionModal}
          onClose={() => {
            setShowAISessionModal(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          courseId={selectedAssignment.courseId}
          onSubmissionSuccess={() => {
            loadAssignments();
          }}
        />
      )}

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        courseId={1} // TODO: Get from navigation params
        onSuccess={() => {
          loadAssignments();
        }}
      />
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
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  assignmentCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  typeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  assignmentTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  assignmentDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  dueDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
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
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priority: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  maxScore: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
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
});
