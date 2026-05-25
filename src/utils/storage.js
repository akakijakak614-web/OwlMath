import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PROGRESS: '@owlmath_progress',
  XP: '@owlmath_xp',
  STREAK: '@owlmath_streak',
  HEARTS: '@owlmath_hearts',
  LAST_PLAYED: '@owlmath_last_played',
  COMPLETED_LESSONS: '@owlmath_completed_lessons',
};

// Default state
const DEFAULT_STATE = {
  xp: 0,
  streak: 0,
  hearts: 5,
  lastPlayed: null,
  completedLessons: {
    elementary: [],
    middle: [],
    high: [],
  },
  currentLevel: 'elementary',
};

export async function loadProgress() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_STATE;
  } catch (error) {
    console.error('Error loading progress:', error);
    return DEFAULT_STATE;
  }
}

export async function saveProgress(progress) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export async function resetProgress() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS);
    return DEFAULT_STATE;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return DEFAULT_STATE;
  }
}

export function calculateLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return 10;
}

export function xpForNextLevel(currentXp) {
  const thresholds = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 99999];
  const level = calculateLevel(currentXp);
  return thresholds[level - 1];
}

export function checkStreak(lastPlayed) {
  if (!lastPlayed) return 0;
  const now = new Date();
  const last = new Date(lastPlayed);
  const diffHours = (now - last) / (1000 * 60 * 60);
  if (diffHours < 24) return -1; // same day, don't increment
  if (diffHours < 48) return 1;  // next day, increment
  return 0; // streak broken
}
