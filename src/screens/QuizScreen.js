import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../theme';
import { getTasksForLesson } from '../data/tasks';
import { saveProgress } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ENCOURAGEMENTS = ['Молодец! 🎉', 'Отлично! ⭐', 'Супер! 🚀', 'Верно! ✅', 'Так держать! 💪'];
const WRONG_MESSAGES = ['Не совсем 😅', 'Попробуй ещё! 💭', 'Почти! 🤔'];

export default function QuizScreen({ navigation, route }) {
  const { levelKey, lessonIndex, progress, setProgress } = route.params;
  const tasks = getTasksForLesson(levelKey, lessonIndex);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hearts, setHearts] = useState(progress.hearts);
  const [xpEarned, setXpEarned] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentTask = tasks[currentTaskIndex];
  const totalTasks = tasks.length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentTaskIndex) / totalTasks,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentTaskIndex]);

  const normalizeAnswer = (answer) => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/,/g, '.')
      .replace(/х/g, 'x')  // Russian x to Latin x
      .replace(/у/g, 'y')  // Russian y to Latin y
      ;
  };

  const checkNumericTokensMatch = (userAns, correctAns) => {
    const parseTokens = (str) => {
      // 1. Convert Russian 'и', 'или' to spaces
      let s = str.toLowerCase().replace(/\b(?:и|или)\b/g, ' ');
      
      // 2. Remove variable names/labels (e.g. x1, y_2, x₂, a, etc.)
      s = s.replace(/[a-zа-яё_]+[0-9₁₂₃₄₅₆₇₈₉₀]*/gi, ' ');
      
      // 3. Replace all characters except digits, signs, dots, commas, semicolons, and spaces with spaces
      s = s.replace(/[^\d\-+.,;\s]/g, ' ');

      const getTokens = (treatCommaAsDecimal) => {
        let temp = s;
        if (treatCommaAsDecimal) {
          // replace comma between digits with dot
          temp = temp.replace(/(\d),(\d)/g, '$1.$2');
        }
        // replace any remaining commas and semicolons with space
        temp = temp.replace(/[,;]/g, ' ');
        // split by spaces and filter valid numbers
        return temp
          .split(/\s+/)
          .map(t => t.trim())
          .filter(t => t && t !== '-' && t !== '+')
          .map(t => parseFloat(t))
          .filter(n => !isNaN(n));
      };

      return {
        tokensA: getTokens(true),  // treat comma as decimal
        tokensB: getTokens(false), // treat comma as separator
      };
    };

    const user = parseTokens(userAns);
    const correct = parseTokens(correctAns);

    const compareLists = (list1, list2) => {
      if (list1.length !== list2.length) return false;
      if (list1.length === 0) return false;
      
      // Check exact order match
      const exactMatch = list1.every((val, i) => Math.abs(val - list2[i]) < 1e-9);
      if (exactMatch) return true;

      // Check sorted match (order doesn't matter)
      const sorted1 = [...list1].sort((a, b) => a - b);
      const sorted2 = [...list2].sort((a, b) => a - b);
      return sorted1.every((val, i) => Math.abs(val - sorted2[i]) < 1e-9);
    };

    // Compare any of user's interpretations with any of correct's interpretations
    return (
      compareLists(user.tokensA, correct.tokensA) ||
      compareLists(user.tokensA, correct.tokensB) ||
      compareLists(user.tokensB, correct.tokensA) ||
      compareLists(user.tokensB, correct.tokensB)
    );
  };

  const checkAnswer = () => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(currentTask.answer);

    // 1. Try exact match first
    let correct = normalizedUser === normalizedCorrect;

    // 2. Try smart matching for numeric answers if not matched exactly
    if (!correct) {
      const isMultipleNumeric = (str) => {
        // Remove helper symbols/words and see if we have multiple numbers
        const clean = str.toLowerCase()
          .replace(/\b(?:и|или)\b/g, ' ')
          .replace(/[a-zа-яё_]+[0-9₁₂₃₄₅₆₇₈₉₀]*/gi, ' ')
          .replace(/[^\d\-+.,;\s]/g, ' ')
          .trim();
        const parts = clean.split(/\s+/).filter(p => p.length > 0);
        if (parts.length < 2) return false;
        return parts.every(part => {
          const num = part.replace(/,/g, '.');
          return !isNaN(parseFloat(num)) && isFinite(num);
        });
      };

      const isSingleNumeric = (str) => {
        const clean = str.trim().replace(/,/g, '.');
        return !isNaN(parseFloat(clean)) && isFinite(clean) && /^-?\d+(?:\.\d+)?$/.test(clean);
      };

      if (isMultipleNumeric(currentTask.answer)) {
        correct = checkNumericTokensMatch(userAnswer, currentTask.answer);
      } else if (isSingleNumeric(currentTask.answer)) {
        const userNum = parseFloat(userAnswer.trim().replace(/,/g, '.'));
        const correctNum = parseFloat(currentTask.answer.trim().replace(/,/g, '.'));
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          correct = Math.abs(userNum - correctNum) < 1e-9;
        }
      }
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      setXpEarned(prev => prev + 10);

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setHearts(prev => Math.max(0, prev - 1));

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    // Show feedback
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const nextTask = async () => {
    if (hearts <= 0) {
      // No hearts left — update progress and go back
      const newProgress = {
        ...progress,
        hearts: 0,
      };
      setProgress(newProgress);
      await saveProgress(newProgress);
      navigation.goBack();
      return;
    }

    if (currentTaskIndex + 1 >= totalTasks) {
      // Lesson complete!
      const newCompletedLessons = { ...progress.completedLessons };
      if (!newCompletedLessons[levelKey].includes(lessonIndex)) {
        newCompletedLessons[levelKey] = [...newCompletedLessons[levelKey], lessonIndex];
      }

      const today = new Date().toISOString().split('T')[0];
      let newStreak = progress.streak;
      if (progress.lastPlayed !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (progress.lastPlayed === yesterday) {
          newStreak += 1;
        } else if (!progress.lastPlayed) {
          newStreak = 1;
        } else {
          newStreak = 1; // streak broken
        }
      }

      const newProgress = {
        ...progress,
        xp: progress.xp + xpEarned,
        hearts: Math.min(hearts, 5),
        streak: newStreak,
        lastPlayed: today,
        completedLessons: newCompletedLessons,
      };

      setProgress(newProgress);
      await saveProgress(newProgress);
      setShowCompletion(true);
      return;
    }

    // Reset for next task
    setShowResult(false);
    setUserAnswer('');
    feedbackAnim.setValue(0);
    shakeAnim.setValue(0);

    // Slide animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentTaskIndex(prev => prev + 1);
  };

  if (showCompletion) {
    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionContent}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>Урок пройден!</Text>
          <Text style={styles.completionSubtitle}>
            Ты справился с уроком {lessonIndex + 1}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statValue}>+{xpEarned}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>{correctCount}/{totalTasks}</Text>
              <Text style={styles.statLabel}>Верно</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>{hearts}</Text>
              <Text style={styles.statLabel}>Жизни</Text>
            </View>
          </View>

          {/* Accuracy bar */}
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Точность</Text>
            <View style={styles.accuracyBarBg}>
              <View
                style={[
                  styles.accuracyBarFill,
                  {
                    width: `${(correctCount / totalTasks) * 100}%`,
                    backgroundColor: (correctCount / totalTasks) >= 0.8 ? COLORS.success : COLORS.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.accuracyPercent}>
              {Math.round((correctCount / totalTasks) * 100)}%
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>ПРОДОЛЖИТЬ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Hearts */}
        <View style={styles.heartsDisplay}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={[
            styles.heartCount,
            hearts <= 1 && { color: COLORS.error },
          ]}>
            {hearts}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Card */}
        <Animated.View
          style={[
            styles.taskCard,
            {
              transform: [
                { translateX: slideAnim },
                { translateX: shakeAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskNumber}>
              Задание {currentTaskIndex + 1} из {totalTasks}
            </Text>
          </View>

          <Text style={styles.taskLabel}>Решите:</Text>

          <View style={styles.taskTextContainer}>
            <Text style={styles.taskText}>{currentTask.task}</Text>
          </View>

          {/* Answer input */}
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Ваш ответ:</Text>
            <TextInput
              style={[
                styles.answerInput,
                showResult && isCorrect && styles.answerInputCorrect,
                showResult && !isCorrect && styles.answerInputWrong,
              ]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Введите ответ..."
              placeholderTextColor={COLORS.textMuted}
              editable={!showResult}
              returnKeyType="done"
              onSubmitEditing={() => !showResult && userAnswer.trim() && checkAnswer()}
            />
          </View>
        </Animated.View>

        {/* Feedback panel */}
        {showResult && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                opacity: feedbackAnim,
                transform: [{
                  translateY: feedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              },
              isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackEmoji}>
                {isCorrect ? '🎉' : '😔'}
              </Text>
              <Text style={[
                styles.feedbackTitle,
                { color: isCorrect ? COLORS.successDark : COLORS.errorDark },
              ]}>
                {isCorrect
                  ? ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
                  : WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
                }
              </Text>
            </View>

            {!isCorrect && (
              <View style={styles.correctAnswerRow}>
                <Text style={styles.correctAnswerLabel}>Правильный ответ:</Text>
                <Text style={styles.correctAnswerValue}>{currentTask.answer}</Text>
              </View>
            )}

            {isCorrect && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+10 XP</Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomBar}>
        {!showResult ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              !userAnswer.trim() && styles.checkButtonDisabled,
            ]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim()}
          >
            <Text style={styles.checkButtonText}>ПРОВЕРИТЬ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkButton,
              isCorrect ? styles.nextButtonCorrect : styles.nextButtonWrong,
            ]}
            onPress={nextTask}
          >
            <Text style={styles.checkButtonText}>
              {hearts <= 0 ? 'ВЫХОД' : currentTaskIndex + 1 >= totalTasks ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLightest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    ...FONTS.bold,
  },
  progressBarBg: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.progressBg,
    overflow: 'hidden',
    marginHorizontal: SIZES.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  heartsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.sm,
  },
  heartIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  heartCount: {
    fontSize: SIZES.fontLg,
    color: COLORS.heart,
    ...FONTS.bold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.lg,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.md,
  },
  taskHeader: {
    marginBottom: SIZES.md,
  },
  taskNumber: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskLabel: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.semiBold,
    marginBottom: SIZES.sm,
  },
  taskTextContainer: {
    backgroundColor: COLORS.primaryLightest,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  taskText: {
    fontSize: SIZES.fontXl,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    lineHeight: 32,
  },
  answerSection: {
    marginTop: SIZES.sm,
  },
  answerLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    ...FONTS.medium,
  },
  answerInput: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    fontSize: SIZES.fontLg,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    ...FONTS.medium,
  },
  answerInputCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  answerInputWrong: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  feedbackContainer: {
    marginTop: SIZES.md,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
  },
  feedbackCorrect: {
    backgroundColor: COLORS.successLight,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  feedbackWrong: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackEmoji: {
    fontSize: 28,
    marginRight: SIZES.sm,
  },
  feedbackTitle: {
    fontSize: SIZES.fontLg,
    ...FONTS.bold,
  },
  correctAnswerRow: {
    marginTop: SIZES.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
  },
  correctAnswerLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.errorDark,
    ...FONTS.medium,
  },
  correctAnswerValue: {
    fontSize: SIZES.fontLg,
    color: COLORS.errorDark,
    ...FONTS.bold,
    marginTop: 2,
  },
  xpBadge: {
    marginTop: SIZES.sm,
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  xpBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    ...FONTS.bold,
  },
  bottomBar: {
    paddingHorizontal: SIZES.md,
    paddingBottom: 34,
    paddingTop: SIZES.sm,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  checkButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  nextButtonCorrect: {
    backgroundColor: COLORS.success,
  },
  nextButtonWrong: {
    backgroundColor: COLORS.error,
  },

  // Completion screen
  completionContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  completionContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.lg,
  },
  completionEmoji: {
    fontSize: 72,
    marginBottom: SIZES.md,
  },
  completionTitle: {
    fontSize: SIZES.font3xl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: SIZES.sm,
  },
  completionSubtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primaryLightest,
    borderRadius: SIZES.radiusMd,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.fontXl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
  },
  accuracyContainer: {
    width: '100%',
    marginBottom: SIZES.lg,
  },
  accuracyLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginBottom: SIZES.xs,
  },
  accuracyBarBg: {
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.progressBg,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  accuracyPercent: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: 4,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxl,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.button,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    ...FONTS.bold,
    letterSpacing: 1,
  },
});
