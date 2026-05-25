import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../theme';
import { LEVELS, getLessonCount } from '../data/tasks';

const LESSON_ICONS = ['➕', '➖', '✖️', '➗', '🧩', '📊', '📏', '🔺', '💡', '🏆'];

function LessonNode({ lesson, index, isCompleted, isLocked, isCurrent, onPress, totalInLevel }) {
  // Zigzag pattern like Duolingo
  const offsetX = (index % 3 === 0) ? 0 : (index % 3 === 1) ? 50 : -50;

  const getNodeStyle = () => {
    if (isCompleted) {
      return {
        backgroundColor: COLORS.success,
        borderColor: COLORS.successDark,
      };
    }
    if (isCurrent) {
      return {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryDark,
      };
    }
    return {
      backgroundColor: COLORS.border,
      borderColor: '#D1D5DB',
    };
  };

  return (
    <TouchableOpacity
      onPress={() => !isLocked && onPress(lesson)}
      disabled={isLocked}
      activeOpacity={0.8}
      style={[styles.lessonNodeContainer, { marginLeft: offsetX }]}
    >
      {/* Connector line */}
      {index > 0 && (
        <View style={[
          styles.connector,
          { backgroundColor: isCompleted || isCurrent ? COLORS.primaryLight : COLORS.border }
        ]} />
      )}

      <View style={[styles.lessonNode, getNodeStyle(), isCurrent && styles.currentNodeGlow]}>
        {isLocked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : isCompleted ? (
          <Text style={styles.checkIcon}>✅</Text>
        ) : (
          <Text style={styles.lessonIcon}>
            {LESSON_ICONS[index % LESSON_ICONS.length]}
          </Text>
        )}
      </View>

      {isCurrent && (
        <View style={styles.startBadge}>
          <Text style={styles.startBadgeText}>СТАРТ</Text>
        </View>
      )}

      <Text style={[
        styles.lessonLabel,
        isLocked && styles.lessonLabelLocked,
      ]}>
        Урок {lesson + 1}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation, route }) {
  const { progress, setProgress } = route.params;
  const [selectedLevel, setSelectedLevel] = React.useState(progress.currentLevel || 'elementary');

  const currentLevelData = LEVELS.find(l => l.id === selectedLevel);
  const lessonCount = getLessonCount(selectedLevel);
  const completedLessons = progress.completedLessons[selectedLevel] || [];

  const handleLessonPress = (lessonIndex) => {
    navigation.navigate('Quiz', {
      levelKey: selectedLevel,
      lessonIndex,
      progress,
      setProgress,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.streakContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{progress.streak}</Text>
          </View>

          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>⚡</Text>
            <Text style={styles.xpText}>{progress.xp} XP</Text>
          </View>

          <View style={styles.heartsContainer}>
            <Text style={styles.heartIcon}>❤️</Text>
            <Text style={styles.heartText}>{progress.hearts}</Text>
          </View>
        </View>
      </View>

      {/* Level Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.levelTabsContainer}
        contentContainerStyle={styles.levelTabsContent}
      >
        {LEVELS.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              onPress={() => setSelectedLevel(level.id)}
              style={[
                styles.levelTab,
                isSelected && { backgroundColor: level.color },
              ]}
            >
              <Text style={styles.levelTabIcon}>{level.icon}</Text>
              <Text style={[
                styles.levelTabText,
                isSelected && { color: COLORS.white },
              ]}>
                {level.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Level Progress Header */}
      <View style={styles.levelHeader}>
        <Text style={styles.levelTitle}>{currentLevelData?.title}</Text>
        <Text style={styles.levelSubtitle}>{currentLevelData?.subtitle}</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedLessons.length / lessonCount) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessons.length}/{lessonCount} уроков
          </Text>
        </View>
      </View>

      {/* Lesson Path */}
      <ScrollView
        style={styles.pathContainer}
        contentContainerStyle={styles.pathContent}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: lessonCount }, (_, i) => {
          const isCompleted = completedLessons.includes(i);
          const firstIncomplete = Array.from({ length: lessonCount }, (_, j) => j)
            .find(j => !completedLessons.includes(j));
          const isCurrent = i === firstIncomplete;
          const isLocked = i > (firstIncomplete ?? lessonCount);

          return (
            <LessonNode
              key={i}
              lesson={i}
              index={i}
              isCompleted={isCompleted}
              isLocked={isLocked}
              isCurrent={isCurrent}
              onPress={handleLessonPress}
              totalInLevel={lessonCount}
            />
          );
        })}

        {/* Trophy at end */}
        <View style={[styles.lessonNodeContainer, { marginTop: 10 }]}>
          <View style={[
            styles.trophyNode,
            completedLessons.length === lessonCount && styles.trophyNodeCompleted,
          ]}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <Text style={styles.lessonLabel}>Финиш!</Text>
        </View>

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
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: SIZES.md,
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  streakIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  streakText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    ...FONTS.bold,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  xpIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  xpText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    ...FONTS.bold,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  heartIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  heartText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    ...FONTS.bold,
  },
  levelTabsContainer: {
    maxHeight: 60,
    marginTop: SIZES.md,
  },
  levelTabsContent: {
    paddingHorizontal: SIZES.md,
    gap: 8,
  },
  levelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    ...SHADOWS.sm,
  },
  levelTabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  levelTabText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  levelHeader: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  levelTitle: {
    fontSize: SIZES.font2xl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  levelSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: 2,
    ...FONTS.regular,
  },
  progressBarContainer: {
    marginTop: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.progressBg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    marginLeft: SIZES.sm,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  pathContainer: {
    flex: 1,
  },
  pathContent: {
    alignItems: 'center',
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  lessonNodeContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  connector: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginBottom: 4,
  },
  lessonNode: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    ...SHADOWS.md,
  },
  currentNodeGlow: {
    ...SHADOWS.lg,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
  },
  lessonIcon: {
    fontSize: 28,
  },
  lockIcon: {
    fontSize: 24,
  },
  checkIcon: {
    fontSize: 28,
  },
  startBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    marginTop: 6,
    ...SHADOWS.button,
  },
  startBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  lessonLabel: {
    marginTop: 4,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  lessonLabelLocked: {
    color: COLORS.textMuted,
  },
  trophyNode: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderWidth: 4,
    borderColor: '#D1D5DB',
  },
  trophyNodeCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
  },
  trophyIcon: {
    fontSize: 36,
  },
});
