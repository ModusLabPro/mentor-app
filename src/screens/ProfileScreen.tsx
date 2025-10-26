import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearUser } from '../store/slices/userSlice';
import { authService } from '../services/api/authService';
import { profileService } from '../services/api/profileService';
import { UserProfile, UpdateProfileData, Achievement, Activity, ProfileStats } from '../types/profile';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { ProfileInfoTab } from '../components/profile/ProfileInfoTab';
import { ProfileAchievementsTab } from '../components/profile/ProfileAchievementsTab';
import { ProfileActivityTab } from '../components/profile/ProfileActivityTab';
import { ProfileSettingsTab } from '../components/profile/ProfileSettingsTab';
import { ProfileStats as ProfileStatsComponent } from '../components/profile/ProfileStats';
import { colors, spacing, typography } from '../styles';

export const ProfileScreen = () => {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  // Загрузка данных профиля
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileData, achievementsData, activitiesData, statsData] = await Promise.all([
          profileService.getProfile(),
          profileService.getAchievements(),
          profileService.getActivities(),
          profileService.getProfileStats(),
        ]);
        
        setProfile(profileData);
        setAchievements(achievementsData);
        setActivities(activitiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading profile data:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await authService.logout();
              dispatch(clearUser());
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async (data: UpdateProfileData) => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Успешно', 'Профиль обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            // Перезагружаем данные профиля
            const loadProfileData = async () => {
              try {
                setIsLoading(true);
                const [profileData, achievementsData, activitiesData, statsData] = await Promise.all([
                  profileService.getProfile(),
                  profileService.getAchievements(),
                  profileService.getActivities(),
                  profileService.getProfileStats(),
                ]);
                
                setProfile(profileData);
                setAchievements(achievementsData);
                setActivities(activitiesData);
                setStats(statsData);
              } catch (error) {
                console.error('Error loading profile data:', error);
                Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
              } finally {
                setIsLoading(false);
              }
            };
            loadProfileData();
          }}>
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <ProfileInfoTab
            profile={profile}
            isEditing={isEditing}
            onSave={handleSaveProfile}
            onCancel={handleCancelEditing}
            onStartEdit={handleStartEditing}
            isSaving={isSaving}
          />
        );
      case 'achievements':
        return <ProfileAchievementsTab achievements={achievements} />;
      case 'activity':
        return <ProfileActivityTab activities={activities} />;
      case 'settings':
        return <ProfileSettingsTab onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.subtitle}>
          Управление личными данными и настройками аккаунта
        </Text>
      </View>

      {stats && <ProfileStatsComponent stats={stats} />}

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.content}>
        {renderTabContent()}
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
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});
