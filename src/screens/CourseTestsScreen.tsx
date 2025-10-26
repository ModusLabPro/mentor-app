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
import { testService } from '../services/api/testService';
import { Test } from '../types/tests';

interface RouteParams {
  courseId: number;
}

export const CourseTestsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as RouteParams;
  const { user } = useAppSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      const testsData = await testService.getTests(courseId);
      setTests(testsData);
    } catch (error) {
      console.error('Error loading course tests:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить тесты курса');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  const handleTestPress = (testId: number) => {
    navigation.navigate('TestDetail' as never, { testId } as never);
  };

  useEffect(() => {
    loadTests();
  }, [courseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'failed': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'in_progress': return 'В процессе';
      case 'failed': return 'Не пройден';
      default: return 'Не начат';
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
          <Text style={styles.loadingText}>Загрузка тестов...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Тесты курса</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.testsContainer}>
          {tests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Тесты курса отсутствуют</Text>
              <Text style={styles.emptyDescription}>
                В этом курсе пока нет тестов для прохождения
              </Text>
            </View>
          ) : (
            tests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => handleTestPress(test.id)}
              >
                <View style={styles.testHeader}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(test.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.testDescription}>{test.description}</Text>
                
                <View style={styles.testMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(test.difficulty) }]}>
                    <Text style={styles.difficultyText}>{getDifficultyText(test.difficulty)}</Text>
                  </View>
                  <Text style={styles.durationText}>⏱️ {test.duration} мин</Text>
                  <Text style={styles.questionsCount}>📝 {test.questions?.length || 0} вопросов</Text>
                  <Text style={styles.passingScoreText}>🎯 {test.passingScore}%</Text>
                </View>

                {test.status === 'completed' && test.score && (
                  <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>
                      Результат: {test.score}%
                    </Text>
                    <Text style={[
                      styles.resultsStatus,
                      { color: test.score >= test.passingScore ? colors.success : colors.error }
                    ]}>
                      {test.score >= test.passingScore ? 'Пройден' : 'Не пройден'}
                    </Text>
                  </View>
                )}

                {test.status === 'not_started' && (
                  <View style={styles.startContainer}>
                    <Text style={styles.startText}>Нажмите для начала теста</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
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
  testsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  testCard: {
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  testTitle: {
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
  testDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  testMeta: {
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
  questionsCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  passingScoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  resultsContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  resultsStatus: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  startContainer: {
    backgroundColor: colors.primary + '20',
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  startText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});
