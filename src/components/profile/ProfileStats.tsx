import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { ProfileStats as ProfileStatsType } from '../../types/profile';
import { colors, spacing, typography } from '../../styles';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.completedCourses}</Text>
        <Text style={styles.statLabel}>Завершенных курсов</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.completedAssignments}</Text>
        <Text style={styles.statLabel}>Выполненных заданий</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.averageScore}</Text>
        <Text style={styles.statLabel}>Средняя оценка</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalSessions}</Text>
        <Text style={styles.statLabel}>Всего сессий</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});






