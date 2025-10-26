import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { Test, TestAttempt, TestQuestion } from '../types/tests';
import { testService } from '../services/api/testService';

interface TestTakingModalProps {
  visible: boolean;
  onClose: () => void;
  test: Test | null;
  attempt: TestAttempt | null;
  onTestCompleted: () => void;
}

export const TestTakingModal: React.FC<TestTakingModalProps> = ({
  visible,
  onClose,
  test,
  attempt,
  onTestCompleted,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    if (attempt && test) {
      setTimeLeft(test.duration * 60); // конвертируем минуты в секунды
      
      // Инициализируем answers из attempt если они есть
      if (attempt.answers && attempt.answers.length > 0) {
        const initialAnswers: Record<number, string | string[]> = {};
        attempt.answers.forEach(ans => {
          initialAnswers[ans.questionId] = ans.answer;
        });
        setAnswers(initialAnswers);
      }
    }
  }, [attempt, test]);

  useEffect(() => {
    if (timeLeft > 0 && visible) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, visible]);

  // Автоматическое закрытие модального окна после завершения теста
  useEffect(() => {
    if (testCompleted) {
      const timer = setTimeout(() => {
        onTestCompleted();
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [testCompleted, onTestCompleted, onClose]);

  const handleSubmitTest = async () => {
    if (!attempt || !test) {
      console.error('Missing attempt or test:', { attempt, test });
      Alert.alert('Ошибка', 'Данные теста не загружены');
      return;
    }

    // Проверяем, что есть ответы
    if (Object.keys(answers).length === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, ответьте хотя бы на один вопрос');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Submitting test - FULL DATA:', { 
        test: test,
        attempt: attempt,
        testId: test.id, 
        attemptTestId: attempt.testId, 
        attemptId: attempt.id,
        usingTestId: test.id, // ID который мы используем для API
        answers: answers,
        answersCount: Object.keys(answers).length,
        testQuestions: test.questions?.length || 0,
        endpoint: `/tests/${test.id}/submit`
      });
      
      // Проверяем, что test.id существует
      if (!test.id) {
        throw new Error('Test ID is missing');
      }
      
      // Проверяем, что answers не пустые
      if (Object.keys(answers).length === 0) {
        throw new Error('No answers provided');
      }
      
      // Отправляем тест - используем test.id как в mentor-react
      const result = await testService.submitTest(test.id, answers);
      
      // Запускаем автоматическую проверку AI (если тест еще не проверялся)
      try {
        console.log('Starting AI review for test:', test.id);
        await testService.reviewTestWithAI(test.id);
        Alert.alert('Тест завершен', 'Ваши ответы отправлены на проверку. AI ассистент анализирует результаты.');
      } catch (aiError) {
        console.error('AI review failed:', aiError);
        Alert.alert('Тест завершен', 'Ваши ответы отправлены на проверку');
      }

      setTestCompleted(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      Alert.alert('Ошибка', 'Не удалось отправить тест');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (test?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!test || !attempt) {
    return null;
  }

  const currentQuestion = test.questions?.[currentQuestionIndex];
  const totalQuestions = test.questions?.length || 0;
  
  // Отладочное логирование
  console.log('TestTakingModal render:', {
    test: test,
    questions: test?.questions,
    currentQuestionIndex,
    currentQuestion,
    totalQuestions
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{test.title}</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Вопрос {currentQuestionIndex + 1} из {totalQuestions}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Предупреждение о времени */}
        {timeLeft < 300 && timeLeft > 0 && (
          <View style={styles.timeWarningContainer}>
            <Text style={styles.timeWarningIcon}>⚠️</Text>
            <Text style={styles.timeWarningText}>
              Осталось менее 5 минут!
            </Text>
          </View>
        )}

        <ScrollView style={styles.content}>
          {currentQuestion && (
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {currentQuestion.text || 'Вопрос не найден'}
              </Text>
              
              {currentQuestion.type === 'single' && (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        answers[currentQuestion.id] === option.text && styles.optionButtonSelected
                      ]}
                      onPress={() => handleAnswerChange(currentQuestion.id, option.text)}
                    >
                      <Text style={[
                        styles.optionText,
                        answers[currentQuestion.id] === option.text && styles.optionTextSelected
                      ]}>
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {currentQuestion.type === 'multiple' && (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option, index) => {
                    const selectedAnswers = answers[currentQuestion.id] as string[] || [];
                    const isSelected = selectedAnswers.includes(option.text);
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected
                        ]}
                        onPress={() => {
                          const newAnswers = isSelected
                            ? selectedAnswers.filter(a => a !== option.text)
                            : [...selectedAnswers, option.text];
                          handleAnswerChange(currentQuestion.id, newAnswers);
                        }}
                      >
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected
                        ]}>
                          {option.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {currentQuestion.type === 'text' && (
                <View style={styles.textAnswerContainer}>
                  <TextInput
                    style={styles.textAnswerInput}
                    value={answers[currentQuestion.id] as string || ''}
                    onChangeText={(text) => handleAnswerChange(currentQuestion.id, text)}
                    placeholder="Введите ваш ответ..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Автоматическое закрытие после завершения */}
        {testCompleted && (
          <View style={styles.completionContainer}>
            <View style={styles.completionIcon}>
              <Text style={styles.completionIconText}>✅</Text>
            </View>
            <Text style={styles.completionTitle}>Тест завершен!</Text>
            <Text style={styles.completionDescription}>
              Модальное окно закроется автоматически через 3 секунды...
            </Text>
          </View>
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              ← Предыдущий
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.navButtonText}>Следующий →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmitTest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Завершить тест</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[600],
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  timerContainer: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  timerText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.warning,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  progressPercentage: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  questionContainer: {
    paddingVertical: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
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
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  timeWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  timeWarningIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  timeWarningText: {
    fontSize: typography.fontSizes.sm,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
  completionContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.success + '10',
    margin: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  completionIcon: {
    marginBottom: spacing.md,
  },
  completionIconText: {
    fontSize: 48,
  },
  completionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  completionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
});
