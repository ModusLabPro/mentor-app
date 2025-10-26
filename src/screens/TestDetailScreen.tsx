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
import { Test, TestAttempt, TestQuestion, TestReview } from '../types/tests';
import { TestTakingModal } from '../components/TestTakingModal';
import { TestReviewModal } from '../components/TestReviewModal';

interface RouteParams {
  testId: number;
}

export const TestDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { testId } = route.params as RouteParams;
  const { user } = useAppSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [testAttempt, setTestAttempt] = useState<TestAttempt | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testReview, setTestReview] = useState<TestReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const loadTest = async () => {
    try {
      setIsLoading(true);
      const testData = await testService.getTestById(testId);
      setTest(testData);
      
      // Загружаем попытку прохождения теста
      try {
        const attempts = await testService.getTestAttempts(testId);
        if (attempts && attempts.length > 0) {
          setTestAttempt(attempts[0]);
          setIsTestStarted(true);
        }
      } catch (error) {
        console.error('Error loading test attempt:', error);
      }

      // Загружаем результаты ИИ если тест завершен
      try {
        const reviews = await testService.getTestReviews(testId);
        if (reviews && reviews.length > 0) {
          setTestReview(reviews[0]);
        }
      } catch (error) {
        console.error('Error loading test review:', error);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить тест');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTest();
    setRefreshing(false);
  };

  const handleStartTest = async () => {
    try {
      // Если попытка уже завершена, создаем новую
      if (testAttempt && testAttempt.status !== 'in_progress') {
        console.log('Previous attempt completed, creating new attempt');
        const newAttempt = await testService.startTest(testId);
        setTestAttempt(newAttempt);
        setIsTestStarted(true);
      } else {
        const attempt = await testService.startTest(testId);
        setTestAttempt(attempt);
        setIsTestStarted(true);
      }
      // Не открываем модальное окно сразу, пользователь сам нажмет "Открыть тест"
    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('Ошибка', 'Не удалось начать тест');
    }
  };

  const handleTestCompleted = () => {
    setShowTestModal(false);
    setIsTestStarted(false);
    loadTest(); // Reload test data to update status/score
  };


  useEffect(() => {
    loadTest();
  }, [testId]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка теста...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!test) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Тест не найден</Text>
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

  const totalQuestions = test.questions?.length || 0;

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
        <Text style={styles.headerTitle}>Тест</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.testHeader}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
            <Text style={styles.statusText}>{getStatusText(test.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.testDescription}>{test.description}</Text>
        
        <View style={styles.testMeta}>
          <Text style={styles.durationText}>⏱️ {test.duration} мин</Text>
          <Text style={styles.questionsCount}>📝 {totalQuestions} вопросов</Text>
          <Text style={styles.passingScoreText}>🎯 Проходной балл: {test.passingScore}%</Text>
        </View>


        {(!isTestStarted || (testAttempt && testAttempt.status !== 'in_progress')) && 
         (!testAttempt || testAttempt.status !== 'completed') && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartTest}
          >
            <Text style={styles.startButtonText}>
              {testAttempt && testAttempt.status !== 'in_progress' ? 'Повторить тест' : 'Начать тест'}
            </Text>
          </TouchableOpacity>
        )}

        {isTestStarted && testAttempt && testAttempt.status === 'in_progress' && (
          <View style={styles.testStartedContainer}>
            <Text style={styles.testStartedText}>
              Тест начат! Нажмите кнопку ниже для прохождения теста.
            </Text>
            <TouchableOpacity
              style={styles.openModalButton}
              onPress={() => setShowTestModal(true)}
            >
              <Text style={styles.openModalButtonText}>Открыть тест</Text>
            </TouchableOpacity>
          </View>
        )}

          {testAttempt && testAttempt.status === 'completed' && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Результаты теста</Text>
              <Text style={styles.resultsScore}>
                Ваш результат: {testAttempt.percentage}%
              </Text>
              <Text style={[
                styles.resultsStatus,
                { color: testAttempt.percentage >= test.passingScore ? colors.success : colors.error }
              ]}>
                {testAttempt.percentage >= test.passingScore ? 'Тест пройден!' : 'Тест не пройден'}
              </Text>
              
              {/* Кнопка для просмотра результатов ИИ */}
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Text style={styles.reviewButtonText}>Посмотреть анализ ИИ</Text>
              </TouchableOpacity>
            </View>
          )}

        {testAttempt && testAttempt.status === 'failed' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Результаты теста</Text>
            <Text style={styles.resultsScore}>
              Ваш результат: {testAttempt.percentage}%
            </Text>
            <Text style={[
              styles.resultsStatus,
              { color: colors.error }
            ]}>
              Тест не пройден
            </Text>
            
            {/* Кнопка для просмотра результатов ИИ */}
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={styles.reviewButtonText}>Посмотреть анализ ИИ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

        <TestTakingModal
          visible={showTestModal}
          onClose={() => setShowTestModal(false)}
          test={test}
          attempt={testAttempt}
          onTestCompleted={handleTestCompleted}
        />

        {/* Модальное окно с результатами ИИ */}
        <TestReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          test={test}
          review={testReview}
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  testTitle: {
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
  testDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  timerContainer: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.warning,
    textAlign: 'center',
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
  questionContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumber: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary,
  },
  questionType: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  questionText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: spacing.lg,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  optionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  textAnswerContainer: {
    marginBottom: spacing.lg,
  },
  textAnswerLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textAnswerInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    minHeight: 100,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  navButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  navButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  navButtonTextDisabled: {
    color: colors.gray[400],
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  resultsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  resultsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  resultsScore: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultsStatus: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  testStartedContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testStartedText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  openModalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  openModalButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  reviewButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});
