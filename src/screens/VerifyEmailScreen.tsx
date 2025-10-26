import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../services/api/authService';
import { colors, spacing, typography } from '../styles';

export const VerifyEmailScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params as { token: string };

  useEffect(() => {
    handleVerifyEmail();
  }, []);

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(token);
      setIsVerified(true);
      Alert.alert(
        'Email подтвержден',
        'Ваш email успешно подтвержден',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось подтвердить email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Подтверждение email</Text>
          <Text style={styles.subtitle}>
            {isLoading 
              ? 'Подтверждаем ваш email...' 
              : isVerified 
                ? 'Email успешно подтвержден!' 
                : 'Произошла ошибка при подтверждении'
            }
          </Text>
        </View>

        {!isVerified && (
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyEmail}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Подтверждение...' : 'Попробовать снова'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.linkText}>Вернуться к входу</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: typography.fontSizes.md,
  },
});
