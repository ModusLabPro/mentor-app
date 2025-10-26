import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../styles';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: string;
}

export const IntegrationsScreen = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Интеграция с Telegram для уведомлений',
      icon: '📱',
      enabled: true,
      category: 'Мессенджеры',
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Синхронизация с календарем',
      icon: '📅',
      enabled: false,
      category: 'Календари',
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Интеграция для видеозвонков',
      icon: '🎥',
      enabled: false,
      category: 'Видеосвязь',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Уведомления в Slack',
      icon: '💬',
      enabled: false,
      category: 'Мессенджеры',
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Синхронизация заметок',
      icon: '📝',
      enabled: false,
      category: 'Продуктивность',
    },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Интеграции</Text>
          <Text style={styles.subtitle}>Подключите внешние сервисы</Text>
        </View>

        {categories.map(category => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {integrations
              .filter(integration => integration.category === category)
              .map(integration => (
                <View key={integration.id} style={styles.integrationCard}>
                  <View style={styles.integrationInfo}>
                    <Text style={styles.integrationIcon}>{integration.icon}</Text>
                    <View style={styles.integrationDetails}>
                      <Text style={styles.integrationName}>{integration.name}</Text>
                      <Text style={styles.integrationDescription}>
                        {integration.description}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={integration.enabled}
                    onValueChange={() => toggleIntegration(integration.id)}
                    trackColor={{ false: colors.gray[300], true: colors.primary }}
                    thumbColor={integration.enabled ? colors.white : colors.gray[500]}
                  />
                </View>
              ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Добавить интеграцию</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => Alert.alert('Информация', 'Функция добавления новых интеграций будет доступна в следующих версиях')}
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Подключить новую интеграцию</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
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
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  integrationDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
  },
  addButtonIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});


