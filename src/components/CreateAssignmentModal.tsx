import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { assignmentService } from '../services/api/assignmentService';
import { CourseAssignmentType, CreateCourseAssignmentData } from '../types/assignments';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  onSuccess?: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateCourseAssignmentData>({
    title: '',
    description: '',
    type: CourseAssignmentType.ANALYSIS,
    priority: 'medium',
    dueDate: '',
    instructions: '',
    expectedOutcome: '',
    estimatedHours: 0,
    tags: [],
    maxScore: 100,
    analysisResultType: 'text',
    analysisQuestions: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните обязательные поля');
      return;
    }

    setIsLoading(true);
    try {
      await assignmentService.createAssignment(formData);
      Alert.alert('Успех', 'Задание создано успешно');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      Alert.alert('Ошибка', 'Не удалось создать задание');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Создать задание</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>
            
            <Text style={styles.label}>Название *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Введите название задания"
            />

            <Text style={styles.label}>Описание *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Введите описание задания"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Тип задания</Text>
            <View style={styles.typeContainer}>
              {Object.values(CourseAssignmentType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type }))}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextSelected
                  ]}>
                    {getTypeText(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дополнительная информация</Text>
            
            <Text style={styles.label}>Инструкции</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.instructions || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
              placeholder="Введите инструкции для выполнения задания"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Ожидаемый результат</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.expectedOutcome || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, expectedOutcome: text }))}
              placeholder="Опишите ожидаемый результат"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Максимальный балл</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maxScore.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxScore: parseInt(text) || 0 }))}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Часов на выполнение</Text>
                <TextInput
                  style={styles.input}
                  value={formData.estimatedHours.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(text) || 0 }))}
                  placeholder="2"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Теги</Text>
            
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Добавить тег"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Text style={styles.addTagButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {formData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {formData.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Создание...' : 'Создать задание'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  typeButtonTextSelected: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    marginRight: spacing.xs,
  },
  removeTagText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  submitContainer: {
    padding: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});


