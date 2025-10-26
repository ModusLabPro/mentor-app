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
import { CourseAssignment, SessionStage } from '../types/assignments';

interface AISessionTrainerAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (submissionData: any) => void;
  assignment: CourseAssignment;
}

interface ChatMessage {
  sender: 'mentor' | 'student';
  message: string;
  timestamp: Date;
  stageId?: number;
}

export const AISessionTrainerAssignmentModal: React.FC<AISessionTrainerAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  assignment
}) => {
  console.log('🔍 AISessionTrainerAssignmentModal rendered with visible:', visible);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [stageNotes, setStageNotes] = useState<{ [stageId: number]: string }>({});
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef<ScrollView>(null);

  const sessionData = assignment.aiSessionTrainerData;
  const currentStage = sessionData?.sessionStructure.stages[currentStageIndex];
  
  console.log('🔍 Session data:', sessionData);
  console.log('🔍 Assignment:', assignment);

  useEffect(() => {
    if (visible) {
      setCurrentStageIndex(0);
      setChatMessages([]);
      setCurrentMessage('');
      setStageNotes({});
      setCompletedStages(new Set());
      setSessionStarted(false);
    }
  }, [visible]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const handleStartSession = () => {
    setSessionStarted(true);
    // Добавляем приветственное сообщение от ИИ
    const welcomeMessage: ChatMessage = {
      sender: 'student',
      message: 'Добро пожаловать на тренировку! Давайте начнём с первого этапа.',
      timestamp: new Date(),
      stageId: currentStage?.id
    };
    setChatMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      sender: 'mentor',
      message: currentMessage,
      timestamp: new Date(),
      stageId: currentStage?.id
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGeneratingResponse(true);

    try {
      // Имитация ответа ИИ
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          sender: 'student',
          message: 'Это демонстрационный ответ студента. В реальном приложении здесь будет ответ от ИИ-студента.',
          timestamp: new Date(),
          stageId: currentStage?.id
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsGeneratingResponse(false);
      }, 2000);
    } catch (error) {
      setIsGeneratingResponse(false);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < (sessionData?.sessionStructure.stages.length || 0) - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  const handlePreviousStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  const handleCompleteStage = () => {
    if (currentStage) {
      setCompletedStages(prev => new Set([...prev, currentStage.id]));
    }
  };

  const handleStageNotesChange = (stageId: number, notes: string) => {
    setStageNotes(prev => ({
      ...prev,
      [stageId]: notes
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        chatMessages,
        stageNotes,
        completedStages: Array.from(completedStages),
        sessionDuration: Date.now() - (sessionStarted ? Date.now() : 0)
      };

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChatMessage = (message: ChatMessage) => (
    <View
      key={`${message.timestamp.getTime()}-${message.sender}`}
      style={[
        styles.messageContainer,
        message.sender === 'mentor' ? styles.mentorMessage : styles.studentMessage
      ]}
    >
      <Text style={styles.messageText}>{message.message}</Text>
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );

  console.log('🔍 Checking sessionData:', sessionData);
  if (!sessionData) {
    console.log('🔍 No session data, but showing modal anyway for debugging');
    // return null; // Временно закомментировано для отладки
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
        
        {/* Временный отладочный текст */}
        <View style={{ padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            DEBUG: Modal is visible!
          </Text>
          <Text style={{ color: 'white' }}>
            Visible: {visible ? 'true' : 'false'}
          </Text>
          <Text style={{ color: 'white' }}>
            Session Data: {sessionData ? 'exists' : 'null'}
          </Text>
        </View>
        
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
          {/* Информация о сессии */}
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{sessionData?.title || 'AI Session Trainer'}</Text>
            <Text style={styles.sessionDescription}>{sessionData?.description || 'Структурированная сессия с AI-ментором'}</Text>
          </View>

          {/* Этапы сессии */}
          <View style={styles.stagesSection}>
            <Text style={styles.sectionTitle}>Этапы сессии</Text>
            <View style={styles.stageContainer}>
              <Text style={styles.stageTitle}>
                {currentStage?.title || 'Этап не выбран'}
              </Text>
              <Text style={styles.stageDescription}>
                {currentStage?.description || 'Описание этапа'}
              </Text>
              <Text style={styles.stageCounter}>
                Этап {currentStageIndex + 1} из {sessionData?.sessionStructure?.stages?.length || 0}
              </Text>
            </View>

            <View style={styles.stageNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentStageIndex === 0 && styles.navButtonDisabled
                ]}
                onPress={handlePreviousStage}
                disabled={currentStageIndex === 0}
              >
                <Text style={[
                  styles.navButtonText,
                  currentStageIndex === 0 && styles.navButtonTextDisabled
                ]}>
                  Назад
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentStageIndex === (sessionData?.sessionStructure?.stages?.length || 1) - 1 && styles.navButtonDisabled
                ]}
                onPress={handleNextStage}
                disabled={currentStageIndex === (sessionData?.sessionStructure?.stages?.length || 1) - 1}
              >
                <Text style={[
                  styles.navButtonText,
                  currentStageIndex === (sessionData?.sessionStructure?.stages?.length || 1) - 1 && styles.navButtonTextDisabled
                ]}>
                  Вперёд
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.completeButton,
                completedStages.has(currentStage?.id || 0) && styles.completeButtonCompleted
              ]}
              onPress={handleCompleteStage}
            >
              <Text style={[
                styles.completeButtonText,
                completedStages.has(currentStage?.id || 0) && styles.completeButtonTextCompleted
              ]}>
                {completedStages.has(currentStage?.id || 0) ? '✓ Завершено' : 'Завершить этап'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Чат */}
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Чат с ИИ-студентом</Text>
            
            {!sessionStarted ? (
              <View style={styles.startSessionContainer}>
                <Text style={styles.startSessionText}>
                  Нажмите кнопку ниже, чтобы начать тренировку
                </Text>
                <TouchableOpacity
                  style={styles.startSessionButton}
                  onPress={handleStartSession}
                >
                  <Text style={styles.startSessionButtonText}>Начать сессию</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView
                  ref={chatContainerRef}
                  style={styles.chatContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {chatMessages.map(renderChatMessage)}
                  {isGeneratingResponse && (
                    <View style={[styles.messageContainer, styles.studentMessage]}>
                      <Text style={styles.messageText}>ИИ печатает...</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.chatInputContainer}>
                  <TextInput
                    style={styles.chatInput}
                    value={currentMessage}
                    onChangeText={setCurrentMessage}
                    placeholder="Напишите сообщение студенту..."
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !currentMessage.trim() && styles.sendButtonDisabled
                    ]}
                    onPress={handleSendMessage}
                    disabled={!currentMessage.trim() || isGeneratingResponse}
                  >
                    <Text style={styles.sendButtonText}>📤</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Заметки по этапу */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Заметки по этапу</Text>
            <TextInput
              style={styles.notesInput}
              value={stageNotes[currentStage?.id || 0] || ''}
              onChangeText={(value) => handleStageNotesChange(currentStage?.id || 0, value)}
              placeholder="Добавьте заметки по текущему этапу..."
              multiline
              numberOfLines={4}
            />
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
  sessionInfo: {
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
  sessionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sessionDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  stagesSection: {
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
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stageContainer: {
    marginBottom: spacing.md,
  },
  stageTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stageDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  stageCounter: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  stageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonCompleted: {
    backgroundColor: colors.gray[300],
  },
  completeButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  completeButtonTextCompleted: {
    color: colors.gray[500],
  },
  chatSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flex: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startSessionContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  startSessionText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  startSessionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  startSessionButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
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
  mentorMessage: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-end',
  },
  studentMessage: {
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
  notesSection: {
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
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    textAlignVertical: 'top',
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
