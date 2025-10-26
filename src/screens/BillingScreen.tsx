import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../styles';

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export const BillingScreen = () => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [plans] = useState<BillingPlan[]>([
    {
      id: 'free',
      name: 'Бесплатный',
      price: 0,
      period: 'месяц',
      features: [
        'До 5 сессий в месяц',
        'Базовый анализ',
        'Поддержка по email',
      ],
    },
    {
      id: 'pro',
      name: 'Профессиональный',
      price: 29,
      period: 'месяц',
      features: [
        'Неограниченные сессии',
        'Расширенный анализ',
        'Приоритетная поддержка',
        'Экспорт отчетов',
        'Интеграции',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Корпоративный',
      price: 99,
      period: 'месяц',
      features: [
        'Все функции Pro',
        'Командная работа',
        'Кастомные интеграции',
        'Персональный менеджер',
        'SLA 99.9%',
      ],
    },
  ]);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      Alert.alert('Информация', 'Вы уже используете бесплатный план');
      return;
    }
    
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите изменить план?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Подтвердить', onPress: () => setCurrentPlan(planId) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Биллинг</Text>
          <Text style={styles.subtitle}>Управление подпиской</Text>
        </View>

        <View style={styles.currentPlanSection}>
          <Text style={styles.sectionTitle}>Текущий план</Text>
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanName}>
              {plans.find(p => p.id === currentPlan)?.name}
            </Text>
            <Text style={styles.currentPlanPrice}>
              {plans.find(p => p.id === currentPlan)?.price === 0 
                ? 'Бесплатно' 
                : `$${plans.find(p => p.id === currentPlan)?.price}/месяц`
              }
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Доступные планы</Text>
          {plans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.popular && styles.popularPlan,
                currentPlan === plan.id && styles.selectedPlan,
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Популярный</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  {plan.price === 0 ? 'Бесплатно' : `$${plan.price}/${plan.period}`}
                </Text>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {currentPlan === plan.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Текущий план</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>История платежей</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>История платежей пуста</Text>
            <Text style={styles.emptyStateSubtext}>
              Здесь будут отображаться ваши транзакции
            </Text>
          </View>
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
  currentPlanSection: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  currentPlanCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  currentPlanName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  currentPlanPrice: {
    fontSize: typography.fontSizes.lg,
    color: colors.white,
  },
  planCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  popularPlan: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedPlan: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  planPrice: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  planFeatures: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    color: colors.success,
    fontSize: typography.fontSizes.md,
    marginRight: spacing.sm,
    fontWeight: typography.fontWeights.bold,
  },
  featureText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
});


