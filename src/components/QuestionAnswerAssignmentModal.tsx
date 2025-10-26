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
import { CourseAssignment, QuestionAnswerQuestion } from '../types/assignments';

interface QuestionAnswerAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (answers: any[]) => void;
  assignment: CourseAssignment;
}

export const QuestionAnswerAssignmentModal: React.FC<QuestionAnswerAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  assignment
}) => {
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnswers({});
    }
  }, [visible]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Проверяем, что все обязательные вопросы заполнены
    const questions = assignment.questionAnswerData?.questions || [];
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]);

    if (missingAnswers.length > 0) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные вопросы');
      return;
    }

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

  const renderQuestion = (question: QuestionAnswerQuestion, index: number) => {
    const questionId = question.id || index;
    
    return (
      <View key={questionId} style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
          {question.required && <Text style={styles.required}> *</Text>}
        </Text>
        {question.description && (
          <Text style={styles.questionDescription}>{question.description}</Text>
        )}
        <TextInput
          style={styles.textInput}
          value={answers[questionId] || ''}
          onChangeText={(value) => handleAnswerChange(questionId.toString(), value)}
          placeholder="Введите ваш ответ..."
          multiline
          numberOfLines={4}
        />
      </View>
    );
  };

  const questions = assignment.questionAnswerData?.questions || [];

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
          <Text style={styles.headerTitle}>{assignment.title}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
            <Text style={styles.assignmentDescription}>{assignment.description}</Text>
            {assignment.instructions && (
              <Text style={styles.assignmentInstructions}>
                Инструкции: {assignment.instructions}
              </Text>
            )}
          </View>

          {questions.map((question, index) => renderQuestion(question, index))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Отправить ответы</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: spacing.sm,
  },
  questionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
    fontStyle: 'italic',
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
});
