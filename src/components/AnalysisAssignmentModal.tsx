import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { CourseAssignment, AnalysisQuestion, AnalysisResultType } from '../types/assignments';

interface AnalysisAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (answers: any[]) => void;
  assignment: CourseAssignment;
  questions: AnalysisQuestion[];
  resultType: AnalysisResultType;
  analysisTitle?: string;
}

export const AnalysisAssignmentModal: React.FC<AnalysisAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  assignment,
  questions,
  resultType,
  analysisTitle
}) => {
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnswers({});
      setShowResults(false);
      setResults([]);
    }
  }, [visible]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    // Проверяем, что все обязательные вопросы заполнены
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]);

    if (missingAnswers.length > 0) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные вопросы');
      return;
    }

    // Формируем массив ответов
    const answersArray = questions.map(q => ({
      questionId: q.id,
      value: answers[q.id] || ''
    }));

    // Генерируем результаты для демонстрации
    const demoResults = questions.map(q => ({
      question: q.question,
      value: answers[q.id] || 0
    }));

    setResults(demoResults);
    setShowResults(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersArray = questions.map(q => ({
        questionId: q.id,
        value: answers[q.id] || ''
      }));

      await onSubmit(answersArray);
      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: AnalysisQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.question}
              {question.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={answers[question.id] || ''}
              onChangeText={(value) => handleAnswerChange(question.id, value)}
              placeholder="Введите ваш ответ..."
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 'rating':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.question}
              {question.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    answers[question.id] === rating && styles.ratingButtonSelected
                  ]}
                  onPress={() => handleAnswerChange(question.id, rating)}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    answers[question.id] === rating && styles.ratingButtonTextSelected
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'single_choice':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.question}
              {question.required && <Text style={styles.required}> *</Text>}
            </Text>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[question.id] === option && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerChange(question.id, option)}
              >
                <Text style={[
                  styles.optionButtonText,
                  answers[question.id] === option && styles.optionButtonTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple_choice':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.question}
              {question.required && <Text style={styles.required}> *</Text>}
            </Text>
            {question.options?.map((option, index) => {
              const currentAnswers = answers[question.id] || [];
              const isSelected = currentAnswers.includes(option);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected
                  ]}
                  onPress={() => {
                    const currentAnswers = answers[question.id] || [];
                    const newAnswers = isSelected
                      ? currentAnswers.filter((a: string) => a !== option)
                      : [...currentAnswers, option];
                    handleAnswerChange(question.id, newAnswers);
                  }}
                >
                  <Text style={[
                    styles.optionButtonText,
                    isSelected && styles.optionButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (resultType === AnalysisResultType.TEXT) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Результаты анализа</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultQuestion}>{result.question}</Text>
              <Text style={styles.resultValue}>{result.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Результаты анализа</Text>
        <Text style={styles.resultsText}>
          Анализ завершен. Результаты будут доступны после обработки.
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {analysisTitle || assignment.title}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!showResults ? (
            <>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentDescription}>{assignment.description}</Text>
                {assignment.instructions && (
                  <Text style={styles.assignmentInstructions}>
                    Инструкции: {assignment.instructions}
                  </Text>
                )}
              </View>

              {questions.map(renderQuestion)}
            </>
          ) : (
            renderResults()
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!showResults ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Показать результаты</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.finalSubmitButton}
              onPress={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.finalSubmitButtonText}>Отправить задание</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSizes.xl,
    color: colors.gray[700],
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  assignmentInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  assignmentDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  assignmentInstructions: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontStyle: 'italic',
  },
  questionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[600],
  },
  ratingButtonTextSelected: {
    color: colors.white,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  optionButtonTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  resultsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  resultItem: {
    marginBottom: spacing.md,
  },
  resultQuestion: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  resultsText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  finalSubmitButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  finalSubmitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});


