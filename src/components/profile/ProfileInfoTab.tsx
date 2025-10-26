import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { UserProfile, UpdateProfileData } from '../../types/profile';
import { colors, spacing, typography } from '../../styles';

interface ProfileInfoTabProps {
  profile: UserProfile;
  isEditing: boolean;
  onSave: (data: UpdateProfileData) => void;
  onCancel: () => void;
  onStartEdit: () => void;
  isSaving: boolean;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  profile,
  isEditing,
  onSave,
  onCancel,
  onStartEdit,
  isSaving,
}) => {
  const [editedData, setEditedData] = useState<UpdateProfileData>({});

  const handleFieldChange = (field: keyof UpdateProfileData, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    setEditedData({});
  };

  const handleStartEdit = () => {
    setEditedData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      specialization: profile.specialization || '',
      experience: profile.experience || 0,
    });
    onStartEdit();
  };

  const handleCancel = () => {
    setEditedData({});
    onCancel();
  };

  const getDisplayValue = (field: keyof UpdateProfileData, defaultValue: string | number = '') => {
    if (isEditing && editedData[field] !== undefined) {
      return editedData[field]?.toString() || '';
    }
    return profile[field]?.toString() || defaultValue.toString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, profile.role === 'admin' ? styles.adminBadge : styles.mentorBadge]}>
            <Text style={styles.badgeText}>
              {profile.role === 'admin' ? '👥 Admin' : '👤 Ментор'}
            </Text>
          </View>
          <View style={[styles.badge, profile.isEmailVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
            <Text style={styles.badgeText}>
              {profile.isEmailVerified ? 'Подтвержден' : 'Не подтвержден'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={getDisplayValue('firstName')}
              onChangeText={(value) => handleFieldChange('firstName', value)}
              editable={isEditing}
              placeholder="Введите имя"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Фамилия</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={getDisplayValue('lastName')}
              onChangeText={(value) => handleFieldChange('lastName', value)}
              editable={isEditing}
              placeholder="Введите фамилию"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={getDisplayValue('phone')}
              onChangeText={(value) => handleFieldChange('phone', value)}
              editable={isEditing}
              placeholder="+7 (999) 123-45-67"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.label}>Роль</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.role}
              editable={false}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Опыт (лет)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={getDisplayValue('experience', 0)}
              onChangeText={(value) => handleFieldChange('experience', parseInt(value) || 0)}
              editable={isEditing}
              placeholder="5"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Специализация</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={getDisplayValue('specialization')}
            onChangeText={(value) => handleFieldChange('specialization', value)}
            editable={isEditing}
            placeholder="Карьерное консультирование, Развитие лидерства"
            multiline
          />
        </View>

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>
                {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>❌ Отмена</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleStartEdit}
          >
            <Text style={styles.buttonText}>✏️ Редактировать</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  adminBadge: {
    backgroundColor: '#8B5CF6',
  },
  mentorBadge: {
    backgroundColor: colors.primary,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
  },
  unverifiedBadge: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  formSection: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});

