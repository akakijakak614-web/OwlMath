import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../theme';
import { LEVELS, getLessonCount } from '../data/tasks';
import { calculateLevel, xpForNextLevel, resetProgress } from '../utils/storage';
import { saveProgress } from '../utils/storage';

export default function ProfileScreen({ route, navigation }) {
  const { progress, setProgress, user, onLogout } = route.params;

  const level = calculateLevel(progress.xp);
  const nextLevelXp = xpForNextLevel(progress.xp);
  const prevLevelXp = level > 1 ? xpForNextLevel(progress.xp - 1) : 0;

  // Calculate previous level threshold properly
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || 99999;
  const xpInLevel = progress.xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const xpProgress = xpNeeded > 0 ? xpInLevel / xpNeeded : 1;

  const totalCompleted = Object.values(progress.completedLessons)
    .reduce((sum, lessons) => sum + lessons.length, 0);
  const totalLessons = LEVELS.reduce((sum, l) => sum + getLessonCount(l.id), 0);

  const handleResetProgress = () => {
    Alert.alert(
      'Сбросить прогресс?',
      'Все ваши данные будут удалены. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            const fresh = await resetProgress();
            setProgress(fresh);
          },
        },
      ],
    );
  };

  const handleRefillHearts = () => {
    const newProgress = { ...progress, hearts: 5 };
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{user?.avatar || '🦉'}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{level}</Text>
          </View>
        </View>

        <Text style={styles.username}>{user?.name || 'Ученик'}</Text>
        <Text style={styles.joinDate}>
          {progress.lastPlayed
            ? `Последняя игра: ${new Date(progress.lastPlayed).toLocaleDateString('ru-RU')}`
            : 'Начни своё первое задание!'}
        </Text>

        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Уровень {level}</Text>
            <Text style={styles.xpValue}>{progress.xp} XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpToNext}>
            {xpInLevel} / {xpNeeded} XP до уровня {level + 1}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.statCardIcon}>🔥</Text>
          <Text style={styles.statCardValue}>{progress.streak}</Text>
          <Text style={styles.statCardLabel}>Серия дней</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#EDE9FE' }]}>
          <Text style={styles.statCardIcon}>⚡</Text>
          <Text style={styles.statCardValue}>{progress.xp}</Text>
          <Text style={styles.statCardLabel}>Всего XP</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.statCardIcon}>✅</Text>
          <Text style={styles.statCardValue}>{totalCompleted}</Text>
          <Text style={styles.statCardLabel}>Уроков</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.statCardIcon}>❤️</Text>
          <Text style={styles.statCardValue}>{progress.hearts}</Text>
          <Text style={styles.statCardLabel}>Жизни</Text>
        </View>
      </View>

      {/* Hearts Section */}
      {progress.hearts < 5 && (
        <TouchableOpacity style={styles.refillCard} onPress={handleRefillHearts}>
          <View style={styles.refillContent}>
            <Text style={styles.refillIcon}>❤️‍🩹</Text>
            <View style={styles.refillTextContainer}>
              <Text style={styles.refillTitle}>Восстановить жизни</Text>
              <Text style={styles.refillSubtitle}>
                {progress.hearts}/5 жизней
              </Text>
            </View>
          </View>
          <Text style={styles.refillButton}>Бесплатно</Text>
        </TouchableOpacity>
      )}

      {/* Level Progress Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Прогресс по разделам</Text>
      </View>

      {LEVELS.map((level) => {
        const completed = progress.completedLessons[level.id]?.length || 0;
        const total = getLessonCount(level.id);
        const pct = total > 0 ? completed / total : 0;

        return (
          <View key={level.id} style={styles.levelProgressCard}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelProgressIcon}>{level.icon}</Text>
              <View style={styles.levelProgressInfo}>
                <Text style={styles.levelProgressTitle}>{level.title}</Text>
                <Text style={styles.levelProgressSubtitle}>{level.subtitle}</Text>
              </View>
              <Text style={styles.levelProgressPct}>
                {Math.round(pct * 100)}%
              </Text>
            </View>
            <View style={styles.levelProgressBarBg}>
              <View
                style={[
                  styles.levelProgressBarFill,
                  {
                    width: `${pct * 100}%`,
                    backgroundColor: level.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.levelProgressCount}>
              {completed} из {total} уроков пройдено
            </Text>
          </View>
        );
      })}

      {/* Achievements */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Достижения</Text>
      </View>

      <View style={styles.achievementsGrid}>
        {[
          { icon: '🌟', title: 'Первый шаг', desc: 'Пройти первый урок', unlocked: totalCompleted >= 1 },
          { icon: '🔥', title: 'На огне', desc: 'Серия 3 дня', unlocked: progress.streak >= 3 },
          { icon: '💯', title: 'Отличник', desc: 'Набрать 100 XP', unlocked: progress.xp >= 100 },
          { icon: '🧠', title: 'Математик', desc: 'Пройти 10 уроков', unlocked: totalCompleted >= 10 },
          { icon: '🏆', title: 'Чемпион', desc: 'Пройти весь раздел', unlocked: LEVELS.some(l => (progress.completedLessons[l.id]?.length || 0) >= getLessonCount(l.id)) },
          { icon: '🦉', title: 'Мудрая сова', desc: 'Набрать 1000 XP', unlocked: progress.xp >= 1000 },
        ].map((achievement, index) => (
          <View
            key={index}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked,
            ]}
          >
            <Text style={[
              styles.achievementIcon,
              !achievement.unlocked && { opacity: 0.3 },
            ]}>
              {achievement.icon}
            </Text>
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && { color: COLORS.textMuted },
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDesc}>{achievement.desc}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>

      {/* Reset */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetProgress}
      >
        <Text style={styles.resetButtonText}>Сбросить прогресс</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: SIZES.md,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.md,
    marginBottom: SIZES.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLightest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  levelBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    ...FONTS.bold,
  },
  username: {
    fontSize: SIZES.font2xl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  joinDate: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...FONTS.regular,
  },
  xpSection: {
    width: '100%',
    marginTop: SIZES.md,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  xpLabel: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  xpValue: {
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  xpBarBg: {
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.progressBg,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  xpToNext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
    ...FONTS.regular,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statCardIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: SIZES.font2xl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  statCardLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  refillCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.heart,
    ...SHADOWS.sm,
  },
  refillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refillIcon: {
    fontSize: 28,
    marginRight: SIZES.sm,
  },
  refillTextContainer: {
    flex: 1,
  },
  refillTitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  refillSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  refillButton: {
    fontSize: SIZES.fontMd,
    color: COLORS.success,
    ...FONTS.bold,
  },
  sectionHeader: {
    marginTop: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  levelProgressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.sm,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  levelProgressIcon: {
    fontSize: 28,
    marginRight: SIZES.sm,
  },
  levelProgressInfo: {
    flex: 1,
  },
  levelProgressTitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  levelProgressSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  levelProgressPct: {
    fontSize: SIZES.fontLg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  levelProgressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progressBg,
    overflow: 'hidden',
  },
  levelProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelProgressCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginTop: 4,
    ...FONTS.regular,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  achievementCard: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  achievementLocked: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.7,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: SIZES.fontXs,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: COLORS.errorLight,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  resetButtonText: {
    color: COLORS.error,
    fontSize: SIZES.fontBase,
    ...FONTS.semiBold,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  logoutButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.fontBase,
    ...FONTS.bold,
  },
});
