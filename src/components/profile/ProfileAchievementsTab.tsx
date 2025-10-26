import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Achievement } from '../../types/profile';
import { colors, spacing, typography } from '../../styles';

interface ProfileAchievementsTabProps {
  achievements: Achievement[];
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  achievements,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {achievements.map((achievement, index) => (
          <View
            key={index}
            style={[
              styles.achievementCard,
              achievement.earned ? styles.earnedCard : styles.unearnedCard,
            ]}
          >
            <View style={styles.achievementContent}>
              <View
                style={[
                  styles.iconContainer,
                  achievement.earned ? styles.earnedIcon : styles.unearnedIcon,
                ]}
              >
                <Text style={styles.icon}>{achievement.icon}</Text>
              </View>
              <View style={styles.textContent}>
                <Text style={styles.title}>{achievement.title}</Text>
                <Text style={styles.description}>{achievement.description}</Text>
                {achievement.earned && achievement.date && (
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>
                      Получено {achievement.date}
                    </Text>
                  </View>
                )}
                {!achievement.earned && (
                  <View style={styles.unearnedBadge}>
                    <Text style={styles.unearnedText}>Не получено</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: spacing.md,
    gap: spacing.md,
  },
  achievementCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  earnedCard: {
    borderColor: colors.primary,
  },
  unearnedCard: {
    opacity: 0.6,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  earnedIcon: {
    backgroundColor: `${colors.primary}20`,
  },
  unearnedIcon: {
    backgroundColor: `${colors.gray[400]}20`,
  },
  icon: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dateBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  unearnedBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  unearnedText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
});

