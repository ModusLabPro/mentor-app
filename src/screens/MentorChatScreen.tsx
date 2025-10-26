import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, spacing, typography } from '../styles';

export const MentorChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Добро пожаловать в чат с менторами! Здесь вы можете общаться с другими менторами и делиться опытом.',
      isUser: false,
      timestamp: new Date(),
      sender: 'Система',
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date(),
      sender: 'Вы',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.title}>Чат с менторами</Text>
        <Text style={styles.subtitle}>Общайтесь с коллегами</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.isUser ? styles.userMessage : styles.systemMessage
            ]}
          >
            <Text style={styles.senderName}>{msg.sender}</Text>
            <Text style={[
              styles.messageText,
              msg.isUser ? styles.userMessageText : styles.systemMessageText
            ]}>
              {msg.text}
            </Text>
            <Text style={styles.messageTime}>
              {msg.timestamp.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Напишите сообщение..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Отправить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  systemMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 20,
    padding: spacing.md,
    borderRadius: 12,
  },
  userMessageText: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  systemMessageText: {
    backgroundColor: colors.gray[100],
    color: colors.text,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    fontSize: typography.fontSizes.md,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});


