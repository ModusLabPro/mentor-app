import React, { useState, useEffect, useRef } from 'react';
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
import { CourseAssignment, AITrainerTask, AITrainerChatMessage } from '../types/assignments';

interface AITrainerAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  assignment: CourseAssignment;
}

export const AITrainerAssignmentModal: React.FC<AITrainerAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  assignment
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResponses, setTaskResponses] = useState<{ [key: string]: string }>({});
  const [chatMessages, setChatMessages] = useState<AITrainerChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const messagesEndRef = useRef<ScrollView>(null);

  const aiTrainerData = assignment.aiTrainerData;
  const tasks = aiTrainerData?.tasks || [];
  const chatSettings = aiTrainerData?.chatSettings;

  useEffect(() => {
    if (visible) {
      setCurrentTaskIndex(0);
      setTaskResponses({});
      setChatMessages([]);
      setNewMessage('');
    }
  }, [visible]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const currentTask = tasks[currentTaskIndex];

  const handleTaskResponseChange = (taskId: string, response: string) => {
    setTaskResponses(prev => ({
      ...prev,
      [taskId]: response
    }));
  };

  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: AITrainerChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsGeneratingResponse(true);

    try {
      // Имитация ответа ИИ
      setTimeout(() => {
        const aiMessage: AITrainerChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          message: 'Это демонстрационный ответ ИИ. В реальном приложении здесь будет ответ от ИИ-ассистента.',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsGeneratingResponse(false);
      }, 2000);
    } catch (error) {
      setIsGeneratingResponse(false);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        taskResponses,
        chatMessages,
        completedTasks: tasks.length
      };

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTask = (task: AITrainerTask) => (
    <View key={task.id} style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>
      
      <TextInput
        style={styles.taskResponseInput}
        value={taskResponses[task.id] || ''}
        onChangeText={(value) => handleTaskResponseChange(task.id, value)}
        placeholder="Введите ваш ответ на задание..."
        multiline
        numberOfLines={6}
      />
    </View>
  );

  const renderChatMessage = (message: AITrainerChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.aiMessage
      ]}
    >
      <Text style={styles.messageText}>{message.message}</Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );

  if (!aiTrainerData) {
    return null;
  }

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

        <View style={styles.content}>
          {/* Задания */}
          <View style={styles.tasksSection}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>Задания</Text>
              <Text style={styles.taskCounter}>
                {currentTaskIndex + 1} из {tasks.length}
              </Text>
            </View>

            {currentTask && renderTask(currentTask)}

            <View style={styles.taskNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentTaskIndex === 0 && styles.navButtonDisabled
                ]}
                onPress={handlePreviousTask}
                disabled={currentTaskIndex === 0}
              >
                <Text style={[
                  styles.navButtonText,
                  currentTaskIndex === 0 && styles.navButtonTextDisabled
                ]}>
                  Назад
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentTaskIndex === tasks.length - 1 && styles.navButtonDisabled
                ]}
                onPress={handleNextTask}
                disabled={currentTaskIndex === tasks.length - 1}
              >
                <Text style={[
                  styles.navButtonText,
                  currentTaskIndex === tasks.length - 1 && styles.navButtonTextDisabled
                ]}>
                  Вперёд
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Чат с ИИ */}
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Чат с ИИ-ассистентом</Text>
            
            <ScrollView
              ref={messagesEndRef}
              style={styles.chatContainer}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map(renderChatMessage)}
              {isGeneratingResponse && (
                <View style={[styles.messageContainer, styles.aiMessage]}>
                  <Text style={styles.messageText}>ИИ печатает...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Напишите сообщение ИИ..."
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newMessage.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || isGeneratingResponse}
              >
                <Text style={styles.sendButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Завершить тренировку</Text>
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
  tasksSection: {
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
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  taskCounter: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  taskContainer: {
    marginBottom: spacing.md,
  },
  taskTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  taskDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  taskResponseInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  taskNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  navButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  navButtonTextDisabled: {
    color: colors.gray[500],
  },
  chatSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flex: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatContainer: {
    flex: 1,
    marginBottom: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: colors.gray[100],
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    fontSize: typography.fontSizes.md,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  submitButton: {
    backgroundColor: colors.success,
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


