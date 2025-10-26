import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { assignmentService } from '../services/api/assignmentService';
import { CourseAssignment } from '../types/assignments';
import { FormattedText } from './FormattedText';

interface Message {
  id: string;
  content: string;
  sender: 'mentor' | 'mentee';
  timestamp: Date;
  type: 'text' | 'system';
}

interface AISessionTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: CourseAssignment;
  courseId: number;
  onSubmissionSuccess?: () => void;
}

export const AISessionTrainerModal: React.FC<AISessionTrainerModalProps> = ({
  isOpen,
  onClose,
  assignment,
  courseId,
  onSubmissionSuccess,
}) => {
  const [expertise, setExpertise] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caseGenerated, setCaseGenerated] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [mentorNotes, setMentorNotes] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  
  const messagesEndRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Инициализация при открытии
  useEffect(() => {
    if (isOpen) {
      resetSession();
    }
  }, [isOpen]);

  const resetSession = () => {
    setMessages([]);
    setInputMessage('');
    setExpertise('');
    setCaseGenerated(false);
    setSessionStarted(false);
    setCurrentStage(0);
    setMentorNotes('');
    setSessionSummary('');
  };

  const generateCase = async () => {
    if (!expertise.trim()) {
      Alert.alert('Ошибка', 'Введите вашу экспертизу');
      return;
    }

    setIsLoading(true);
    try {
      // Создаем кейс согласно документу - AI-менти генерирует ситуацию на основе экспертизы ментора
      const context = `Ты - ИИ-менти, который создает реалистичный кейс для менторской сессии.

КРИТИЧЕСКИ ВАЖНО: Экспертиза ментора: "${expertise}"

Ты ДОЛЖЕН создать кейс (5-7 предложений) ОБЯЗАТЕЛЬНО связанный с экспертизой ментора "${expertise}". 
НЕ создавай кейсы про фрилансеров, дизайнеров или другие темы - только про "${expertise}"!

Структура кейса:
- Кто я (роль/контекст, 1 предложение) - работаю в области "${expertise}"
- Симптом/затруднение (1-2 предложения) - конкретная проблема в "${expertise}"
- Желание на встречу (что хочу прояснить/достичь сегодня) - связанное с "${expertise}"
- НЕ указывай ограничения/риски, если Ментор этого не спросил
- Тон «скорее общо», без готовых решений

Цель должна быть размытой, чтобы ментор мог ее уточнить вопросами.
Кейс ДОЛЖЕН быть ТОЛЬКО в области "${expertise}"! НЕ создавай кейсы про другие темы!`;

      // Добавляем placeholder для ответа AI
      const caseMessage: Message = {
        id: 'case-' + Date.now(),
        content: '',
        sender: 'mentee',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([caseMessage]);

      // Получаем ответ от API
      console.log('🚀 Starting case generation with expertise:', expertise);
      const fullResponse = await assignmentService.generateCase(courseId, assignment.id, expertise);

      console.log('✅ Response received:', fullResponse);

      // Обновляем сообщение с полным ответом
      setMessages(prev => prev.map(msg => 
        msg.id === caseMessage.id 
          ? { ...msg, content: `Привет! Меня зовут Алексей, и у меня есть ситуация, с которой я не могу разобраться. Вот что происходит:\n\n${fullResponse}` }
          : msg
      ));

      setCaseGenerated(true);
      setSessionStarted(true);
      setCurrentStage(0); // Начинаем с CLARIFY_GOAL

      Alert.alert('Кейс создан', 'Теперь вы можете начать менторскую сессию');

    } catch (error) {
      console.error('Error generating case:', error);
      Alert.alert('Ошибка', 'Не удалось создать кейс. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionStarted) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'mentor',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Контекст теперь обрабатывается на бэкенде

      // Добавляем placeholder для ответа AI
      const menteeMessage: Message = {
        id: 'mentee-' + Date.now(),
        content: '',
        sender: 'mentee',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, menteeMessage]);

      // Получаем ответ от API
      const fullResponse = await assignmentService.generateAIResponse(
        courseId, 
        assignment.id, 
        inputMessage, 
        messages
      );

      // Обновляем сообщение с полным ответом
      setMessages(prev => prev.map(msg => 
        msg.id === menteeMessage.id 
          ? { ...msg, content: fullResponse }
          : msg
      ));

      console.log('✅ AI response received, checking stage progress:', {
        currentStage,
        messagesCount: messages.length,
        responseLength: fullResponse.length
      });

      // Автоматически переходим к следующему этапу после достаточного количества сообщений
      if (messages.length >= 4 && currentStage < 2) {
        setCurrentStage(prev => prev + 1);
        console.log('🔄 Auto-advancing to next stage:', currentStage + 1);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    setIsLoading(true);

    try {
      // Формируем данные для отправки
      const submissionData = {
        conversationData: messages,
        sessionSummary,
        mentorNotes,
        expertise,
        completedStages: currentStage + 1,
        totalStages: 3 // Стандартные этапы: CLARIFY_GOAL, SOLUTION_SEARCH, WRAP_UP
      };

      console.log('📤 Submitting AI Session Trainer:', submissionData);

      // Отправляем результаты сессии
      await assignmentService.submitAISessionTrainerAssignment(courseId, assignment.id, submissionData);
      
      Alert.alert('Успех', 'Сессия завершена! Результаты отправлены на проверку администратору');
      
      // Вызываем callback для обновления статуса
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting session:', error);
      Alert.alert('Ошибка', 'Не удалось отправить результаты сессии. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.flex} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Заголовок */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>AI-тренажёр сессии</Text>
            <TouchableOpacity onPress={resetSession} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!sessionStarted ? (
              /* Начальный экран */
              <View style={styles.startScreen}>
                <Text style={styles.startTitle}>Начните тренировку</Text>
                <Text style={styles.startDescription}>
                  Введите вашу область экспертизы, и ИИ создаст реалистичный кейс для менторской сессии
                </Text>
                
                <TextInput
                  style={styles.expertiseInput}
                  placeholder="Например: разработка мобильных приложений, маркетинг, управление проектами..."
                  value={expertise}
                  onChangeText={setExpertise}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.startButton, (!expertise.trim() || isLoading) && styles.startButtonDisabled]}
                  onPress={generateCase}
                  disabled={!expertise.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.startButtonText}>Создать кейс</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Чат интерфейс */
              <View style={styles.chatContainer}>
                {/* Сообщения */}
                <ScrollView
                  ref={messagesEndRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                >
                  {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageContainer,
                        message.sender === 'mentor' ? styles.mentorMessage : styles.menteeMessage,
                        message.type === 'system' && styles.systemMessage,
                      ]}
                    >
                      <Text style={[
                        styles.messageText,
                        message.sender === 'mentor' ? styles.mentorMessageText : styles.menteeMessageText,
                        message.type === 'system' && styles.systemMessageText,
                      ]}>
                        <FormattedText text={message.content} />
                      </Text>
                      <Text style={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </View>
                  ))}
                  
                  {isLoading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.loadingText}>ИИ печатает...</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Поле ввода */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Введите ваше сообщение..."
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    multiline
                    maxLength={1000}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Text style={styles.sendButtonText}>Отправить</Text>
                  </TouchableOpacity>
                </View>

                {/* Заметки ментора */}
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Заметки о сессии:</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Добавьте заметки о том, как прошла сессия..."
                    value={mentorNotes}
                    onChangeText={setMentorNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Кнопка завершения */}
                <TouchableOpacity
                  style={[styles.completeButton, isLoading && styles.completeButtonDisabled]}
                  onPress={completeSession}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.completeButtonText}>Завершить и получить отчет</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
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
    fontSize: 16,
    color: colors.gray[600],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  resetButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  content: {
    flex: 1,
  },
  startScreen: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  startDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  expertiseInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
    minHeight: 80,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  mentorMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.sm,
  },
  menteeMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: colors.blue[50],
    borderRadius: 8,
    padding: spacing.sm,
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  mentorMessageText: {
    color: colors.white,
  },
  menteeMessageText: {
    color: colors.text.primary,
  },
  systemMessageText: {
    color: colors.blue[700],
    textAlign: 'center',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    fontSize: 14,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    minHeight: 50,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  notesContainer: {
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 14,
    backgroundColor: colors.white,
    minHeight: 60,
  },
  completeButton: {
    backgroundColor: colors.green[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    margin: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});