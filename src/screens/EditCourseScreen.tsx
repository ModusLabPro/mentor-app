import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles';
import { courseService } from '../services/api/courseService';
import { Course, UpdateCourseData } from '../types/courses';
import { stripAllHtml } from '../utils/htmlUtils';

export const EditCourseScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params as { courseId: number };
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateCourseData>({});
  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    metadata: false,
    content: false,
    mentors: false,
  });

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      setFormData({
        title: courseData.title,
        description: courseData.description,
        content: courseData.content,
        status: courseData.status,
        difficulty: courseData.difficulty,
        duration: courseData.duration,
        tags: courseData.tags || [],
        learningObjectives: courseData.learningObjectives || [],
        prerequisites: courseData.prerequisites || [],
        assignedMentorIds: courseData.assignedMentorIds || [],
        metadata: courseData.metadata || {},
      });
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить курс');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('Ошибка', 'Название курса обязательно для заполнения');
      return;
    }

    if (!formData.description?.trim()) {
      Alert.alert('Ошибка', 'Описание курса обязательно для заполнения');
      return;
    }

    setIsSaving(true);
    try {
      const updatedCourse = await courseService.updateCourse(courseId, formData);
      setCourse(updatedCourse);
      Alert.alert('Успех', 'Курс обновлен успешно');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating course:', error);
      Alert.alert('Ошибка', 'Не удалось обновить курс');
    } finally {
      setIsSaving(false);
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликован';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка курса...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Курс не найден</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактирование курса</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('basicInfo')}
          >
            <Text style={styles.sectionTitle}>Основная информация</Text>
            <Text style={styles.sectionToggle}>
              {expandedSections.basicInfo ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSections.basicInfo && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Название курса *</Text>
              <TextInput
                style={styles.input}
                value={formData.title || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Введите название курса"
              />

              <Text style={styles.label}>Описание курса *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description || ''}
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
          )}
        </View>

        {/* Course Metadata Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('metadata')}
          >
            <Text style={styles.sectionTitle}>Метаданные курса</Text>
            <Text style={styles.sectionToggle}>
              {expandedSections.metadata ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSections.metadata && (
            <View style={styles.sectionContent}>
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

              <Text style={styles.label}>Статус</Text>
              <View style={styles.statusContainer}>
                {['draft', 'published', 'archived'].map((status) => (
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
                      {getStatusText(status)}
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
            </View>
          )}
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('metadata')}
          >
            <Text style={styles.sectionTitle}>Теги</Text>
            <Text style={styles.sectionToggle}>
              {expandedSections.metadata ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSections.metadata && (
            <View style={styles.sectionContent}>
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
          )}
        </View>

        {/* Learning Objectives Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('metadata')}
          >
            <Text style={styles.sectionTitle}>Цели обучения</Text>
            <Text style={styles.sectionToggle}>
              {expandedSections.metadata ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSections.metadata && (
            <View style={styles.sectionContent}>
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
          )}
        </View>

        {/* Prerequisites Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('metadata')}
          >
            <Text style={styles.sectionTitle}>Предварительные требования</Text>
            <Text style={styles.sectionToggle}>
              {expandedSections.metadata ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSections.metadata && (
            <View style={styles.sectionContent}>
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
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  content: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  sectionToggle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  sectionContent: {
    padding: spacing.md,
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
});
