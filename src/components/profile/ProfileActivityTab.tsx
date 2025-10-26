import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Activity } from '../../types/profile';
import { colors, spacing, typography } from '../../styles';

interface ProfileActivityTabProps {
  activities: Activity[];
}

export const ProfileActivityTab: React.FC<ProfileActivityTabProps> = ({
  activities,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Последняя активность</Text>
        <View style={styles.activitiesList}>
          {activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityContent}>
                <Text style={styles.actionText}>{activity.action}</Text>
                <Text style={styles.dateText}>{activity.date}</Text>
              </View>
              {activity.score && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>⭐ {activity.score}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
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
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  activitiesList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  activityContent: {
    flex: 1,
  },
  actionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  scoreBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});


