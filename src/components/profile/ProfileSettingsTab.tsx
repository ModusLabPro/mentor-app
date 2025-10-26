import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../../styles';

interface ProfileSettingsTabProps {
  onLogout: () => void;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  onLogout,
}) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const handleChangePassword = () => {
    Alert.alert('Изменение пароля', 'Функция изменения пароля будет доступна в следующей версии');
  };

  const handleTwoFactorAuth = () => {
    Alert.alert('Двухфакторная аутентификация', 'Функция двухфакторной аутентификации будет доступна в следующей версии');
  };

  const handleActivityLog = () => {
    Alert.alert('Журнал активности', 'Функция журнала активности будет доступна в следующей версии');
  };

  const handleExportData = () => {
    Alert.alert('Экспорт данных', 'Функция экспорта данных будет доступна в следующей версии');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    type = 'switch' 
  }: {
    title: string;
    description: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray[300], true: colors.primary }}
          thumbColor={value ? colors.white : colors.gray[400]}
        />
      ) : (
        <TouchableOpacity onPress={onValueChange as any}>
          <Text style={styles.buttonText}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Настройки аккаунта</Text>
        
        <SettingItem
          title="Email уведомления"
          description="Получать уведомления на email"
          value={emailNotifications}
          onValueChange={setEmailNotifications}
        />
        
        <SettingItem
          title="Push уведомления"
          description="Показывать уведомления в приложении"
          value={pushNotifications}
          onValueChange={setPushNotifications}
        />
        
        <SettingItem
          title="Автосохранение"
          description="Автоматически сохранять изменения"
          value={autoSave}
          onValueChange={setAutoSave}
        />
        
        <SettingItem
          title="Показывать подсказки"
          description="Отображать подсказки по интерфейсу"
          value={showTips}
          onValueChange={setShowTips}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Безопасность</Text>
        
        <SettingItem
          title="Изменить пароль"
          description="Обновить пароль для входа в аккаунт"
          type="button"
          onValueChange={handleChangePassword}
        />
        
        <SettingItem
          title="Двухфакторная аутентификация"
          description="Дополнительная защита аккаунта"
          type="button"
          onValueChange={handleTwoFactorAuth}
        />
        
        <SettingItem
          title="Журнал активности"
          description="Просмотр истории входов в аккаунт"
          type="button"
          onValueChange={handleActivityLog}
        />
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Опасная зона</Text>
        
        <SettingItem
          title="Экспорт данных"
          description="Скачать все данные аккаунта"
          type="button"
          onValueChange={handleExportData}
        />
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>🗑️ Удалить аккаунт</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  dangerTitle: {
    color: colors.error,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  buttonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
  },
  dangerButton: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dangerButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  logoutButton: {
    backgroundColor: colors.error,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});


