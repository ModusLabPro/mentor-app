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
import { courseService } from '../services/api/courseService';
import { CreateCourseData } from '../types/courses';
import { stripAllHtml } from '../utils/htmlUtils';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateCourseData>({
    title: '',
    description: '',
    content: '',
    status: 'draft',
    difficulty: 'beginner',
    duration: 60,
    tags: [],
    learningObjectives: [],
    prerequisites: [],
    assignedMentorIds: [],
    metadata: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Ошибка', 'Название курса обязательно для заполнения');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Ошибка', 'Описание курса обязательно для заполнения');
      return;
    }

    setIsLoading(true);
    try {
      // Если менторы не выбраны, автоматически назначаем текущего пользователя
      let assignedMentorIds = formData.assignedMentorIds || [];
      if (assignedMentorIds.length === 0) {
        // TODO: Get current user ID from auth context
        assignedMentorIds = [1]; // Placeholder
      }

      const courseData: CreateCourseData = {
        ...formData,
        assignedMentorIds,
      };

      await courseService.createCourse(courseData);
      Alert.alert('Успех', 'Курс создан успешно');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Ошибка', 'Не удалось создать курс');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const addObjective = () => {
    if (newObjective.trim() && !(formData.learningObjectives || []).includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...(prev.learningObjectives || []), newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (objectiveToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: (prev.learningObjectives || []).filter(obj => obj !== objectiveToRemove)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !(formData.prerequisites || []).includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...(prev.prerequisites || []), newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisiteToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: (prev.prerequisites || []).filter(prereq => prereq !== prerequisiteToRemove)
    }));
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Начальный';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return difficulty;
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
          <Text style={styles.headerTitle}>Создать курс</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>
            
            <Text style={styles.label}>Название курса *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Введите название курса"
            />

            <Text style={styles.label}>Описание *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Введите описание курса"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Содержание курса</Text>
            <TextInput
              style={[styles.input, styles.largeTextArea]}
              value={formData.content ? stripAllHtml(formData.content) : ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="Введите содержание курса"
              multiline
              textAlignVertical="top"
              scrollEnabled
            />
          </View>

          {/* Course Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Настройки курса</Text>
            
            <Text style={styles.label}>Сложность</Text>
            <View style={styles.difficultyContainer}>
              {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    formData.difficulty === difficulty && styles.difficultyButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, difficulty: difficulty as any }))}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    formData.difficulty === difficulty && styles.difficultyButtonTextSelected
                  ]}>
                    {getDifficultyText(difficulty)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Длительность (минуты)</Text>
            <TextInput
              style={styles.input}
              value={(formData.duration || 0).toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
              placeholder="120"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Статус</Text>
            <View style={styles.statusContainer}>
              {['draft', 'published'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    formData.status === status && styles.statusButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, status: status as any }))}
                >
                  <Text style={[
                    styles.statusButtonText,
                    formData.status === status && styles.statusButtonTextSelected
                  ]}>
                    {status === 'draft' ? 'Черновик' : 'Опубликован'}
                  </Text>
                </TouchableOpacity>
              ))}
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

            {(formData.tags || []).length > 0 && (
              <View style={styles.tagsContainer}>
                {(formData.tags || []).map((tag, index) => (
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

          {/* Learning Objectives */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Цели обучения</Text>
            
            <View style={styles.objectiveInputContainer}>
              <TextInput
                style={[styles.input, styles.objectiveInput]}
                value={newObjective}
                onChangeText={setNewObjective}
                placeholder="Добавить цель обучения"
                onSubmitEditing={addObjective}
              />
              <TouchableOpacity style={styles.addObjectiveButton} onPress={addObjective}>
                <Text style={styles.addObjectiveButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {(formData.learningObjectives || []).length > 0 && (
              <View style={styles.objectivesContainer}>
                {(formData.learningObjectives || []).map((objective, index) => (
                  <View key={index} style={styles.objective}>
                    <Text style={styles.objectiveText}>{objective}</Text>
                    <TouchableOpacity onPress={() => removeObjective(objective)}>
                      <Text style={styles.removeObjectiveText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Prerequisites */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Предварительные требования</Text>
            
            <View style={styles.prerequisiteInputContainer}>
              <TextInput
                style={[styles.input, styles.prerequisiteInput]}
                value={newPrerequisite}
                onChangeText={setNewPrerequisite}
                placeholder="Добавить требование"
                onSubmitEditing={addPrerequisite}
              />
              <TouchableOpacity style={styles.addPrerequisiteButton} onPress={addPrerequisite}>
                <Text style={styles.addPrerequisiteButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {(formData.prerequisites || []).length > 0 && (
              <View style={styles.prerequisitesContainer}>
                {(formData.prerequisites || []).map((prerequisite, index) => (
                  <View key={index} style={styles.prerequisite}>
                    <Text style={styles.prerequisiteText}>{prerequisite}</Text>
                    <TouchableOpacity onPress={() => removePrerequisite(prerequisite)}>
                      <Text style={styles.removePrerequisiteText}>×</Text>
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
                {isLoading ? 'Создание...' : 'Создать курс'}
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
  largeTextArea: {
    minHeight: 200,
    maxHeight: 400,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  difficultyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  difficultyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  difficultyButtonTextSelected: {
    color: colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  statusButtonTextSelected: {
    color: colors.white,
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
  objectiveInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectiveInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addObjectiveButton: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addObjectiveButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  objectivesContainer: {
    marginTop: spacing.sm,
  },
  objective: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  objectiveText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    flex: 1,
    marginRight: spacing.xs,
  },
  removeObjectiveText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  prerequisiteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prerequisiteInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addPrerequisiteButton: {
    backgroundColor: colors.warning,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPrerequisiteButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  prerequisitesContainer: {
    marginTop: spacing.sm,
  },
  prerequisite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  prerequisiteText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    flex: 1,
    marginRight: spacing.xs,
  },
  removePrerequisiteText: {
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
