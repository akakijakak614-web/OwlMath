import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../theme';

// Simulated leaderboard data
const LEADERBOARD_DATA = [
  { id: 1, name: 'Алиса М.', xp: 2450, avatar: '👩‍🎓', streak: 15 },
  { id: 2, name: 'Дмитрий К.', xp: 2120, avatar: '👨‍💻', streak: 12 },
  { id: 3, name: 'Елена В.', xp: 1890, avatar: '👩‍🔬', streak: 10 },
  { id: 4, name: 'Артём П.', xp: 1650, avatar: '🧑‍🎓', streak: 8 },
  { id: 5, name: 'Мария С.', xp: 1420, avatar: '👩‍💼', streak: 7 },
  { id: 6, name: 'Иван Л.', xp: 1200, avatar: '👨‍🎓', streak: 6 },
  { id: 7, name: 'Софья Р.', xp: 980, avatar: '👩‍🏫', streak: 5 },
  { id: 8, name: 'Кирилл Н.', xp: 750, avatar: '🧑‍💻', streak: 4 },
  { id: 9, name: 'Анна Б.', xp: 520, avatar: '👩‍🔬', streak: 3 },
  { id: 10, name: 'Максим Г.', xp: 300, avatar: '👨‍🎓', streak: 2 },
];

function getMedalEmoji(position) {
  if (position === 0) return '🥇';
  if (position === 1) return '🥈';
  if (position === 2) return '🥉';
  return null;
}

export default function LeaderboardScreen({ route }) {
  const { progress } = route.params;

  // Insert "You" at the correct position
  const myEntry = {
    id: 'me',
    name: 'Вы',
    xp: progress.xp,
    avatar: '🦉',
    streak: progress.streak,
    isMe: true,
  };

  const allEntries = [...LEADERBOARD_DATA, myEntry]
    .sort((a, b) => b.xp - a.xp);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Таблица лидеров</Text>
      </View>

      {/* Top 3 podium */}
      <View style={styles.podiumContainer}>
        {/* 2nd place */}
        {allEntries[1] && (
          <View style={styles.podiumItem}>
            <Text style={styles.podiumAvatar}>{allEntries[1].avatar}</Text>
            <View style={[styles.podiumBar, styles.podiumSecond]}>
              <Text style={styles.podiumMedal}>🥈</Text>
              <Text style={styles.podiumXp}>{allEntries[1].xp}</Text>
            </View>
            <Text style={[
              styles.podiumName,
              allEntries[1].isMe && styles.myName,
            ]} numberOfLines={1}>
              {allEntries[1].name}
            </Text>
          </View>
        )}

        {/* 1st place */}
        {allEntries[0] && (
          <View style={styles.podiumItem}>
            <Text style={styles.podiumCrown}>👑</Text>
            <Text style={styles.podiumAvatar}>{allEntries[0].avatar}</Text>
            <View style={[styles.podiumBar, styles.podiumFirst]}>
              <Text style={styles.podiumMedal}>🥇</Text>
              <Text style={styles.podiumXp}>{allEntries[0].xp}</Text>
            </View>
            <Text style={[
              styles.podiumName,
              allEntries[0].isMe && styles.myName,
            ]} numberOfLines={1}>
              {allEntries[0].name}
            </Text>
          </View>
        )}

        {/* 3rd place */}
        {allEntries[2] && (
          <View style={styles.podiumItem}>
            <Text style={styles.podiumAvatar}>{allEntries[2].avatar}</Text>
            <View style={[styles.podiumBar, styles.podiumThird]}>
              <Text style={styles.podiumMedal}>🥉</Text>
              <Text style={styles.podiumXp}>{allEntries[2].xp}</Text>
            </View>
            <Text style={[
              styles.podiumName,
              allEntries[2].isMe && styles.myName,
            ]} numberOfLines={1}>
              {allEntries[2].name}
            </Text>
          </View>
        )}
      </View>

      {/* Rest of leaderboard */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {allEntries.slice(3).map((entry, index) => {
          const position = index + 4;
          return (
            <View
              key={entry.id}
              style={[
                styles.listItem,
                entry.isMe && styles.listItemMe,
              ]}
            >
              <Text style={[
                styles.listPosition,
                entry.isMe && { color: COLORS.primary },
              ]}>
                {position}
              </Text>

              <View style={styles.listAvatarContainer}>
                <Text style={styles.listAvatar}>{entry.avatar}</Text>
              </View>

              <View style={styles.listInfo}>
                <Text style={[
                  styles.listName,
                  entry.isMe && styles.myName,
                ]}>
                  {entry.name}
                </Text>
                <View style={styles.listMeta}>
                  <Text style={styles.listStreak}>🔥 {entry.streak}</Text>
                </View>
              </View>

              <Text style={[
                styles.listXp,
                entry.isMe && { color: COLORS.primary },
              ]}>
                {entry.xp} XP
              </Text>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  headerTitle: {
    fontSize: SIZES.font2xl,
    color: COLORS.white,
    ...FONTS.bold,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumCrown: {
    fontSize: 24,
    marginBottom: -4,
  },
  podiumAvatar: {
    fontSize: 36,
    marginBottom: SIZES.xs,
  },
  podiumBar: {
    width: '80%',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderTopLeftRadius: SIZES.radiusMd,
    borderTopRightRadius: SIZES.radiusMd,
  },
  podiumFirst: {
    backgroundColor: COLORS.accent,
    height: 100,
    justifyContent: 'center',
  },
  podiumSecond: {
    backgroundColor: COLORS.primaryLight,
    height: 80,
    justifyContent: 'center',
  },
  podiumThird: {
    backgroundColor: COLORS.primaryLighter,
    height: 60,
    justifyContent: 'center',
  },
  podiumMedal: {
    fontSize: 24,
  },
  podiumXp: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    ...FONTS.bold,
    marginTop: 4,
  },
  podiumName: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    ...FONTS.medium,
    marginTop: 4,
  },
  myName: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.sm,
  },
  listItemMe: {
    backgroundColor: COLORS.primaryLightest,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  listPosition: {
    width: 30,
    fontSize: SIZES.fontLg,
    color: COLORS.textSecondary,
    ...FONTS.bold,
    textAlign: 'center',
  },
  listAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLightest,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.sm,
  },
  listAvatar: {
    fontSize: 24,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  listMeta: {
    flexDirection: 'row',
    marginTop: 2,
  },
  listStreak: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  listXp: {
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
    ...FONTS.bold,
  },
});
