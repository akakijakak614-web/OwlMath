import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../theme';
import { registerUser } from '../utils/auth';

const AVATARS = ['🦉', '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐸', '🐵', '🦄', '🐰', '🐻'];

export default function RegisterScreen({ navigation, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦉');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: avatar & name, 2: credentials

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const stepTransition = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateStepTransition = (toStep) => {
    Animated.sequence([
      Animated.timing(stepTransition, {
        toValue: -1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(stepTransition, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      setStep(toStep);
      Animated.timing(stepTransition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 200);
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleNextStep = () => {
    setError('');
    if (!name.trim()) {
      setError('Введите ваше имя');
      shakeForm();
      return;
    }
    if (name.trim().length < 2) {
      setError('Имя должно быть не менее 2 символов');
      shakeForm();
      return;
    }
    animateStepTransition(2);
  };

  const handleRegister = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните все поля');
      shakeForm();
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      shakeForm();
      return;
    }

    setLoading(true);
    const result = await registerUser(name.trim(), email, password);
    setLoading(false);

    if (result.success) {
      onRegisterSuccess({ ...result.user, avatar: selectedAvatar });
    } else {
      setError(result.error);
      shakeForm();
    }
  };

  const isStep2Valid = email.trim() && password.trim() && confirmPassword.trim();

  return (
    <View style={styles.container}>
      {/* Decorative elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
            <Text style={styles.headerEmoji}>✨</Text>
            <Text style={styles.headerTitle}>Создай аккаунт</Text>
            <Text style={styles.headerSubtitle}>
              {step === 1
                ? 'Выбери аватар и введи имя'
                : 'Почти готово! Заполни данные'}
            </Text>

            {/* Step indicator */}
            <View style={styles.stepsContainer}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View style={[
            styles.formContainer,
            {
              transform: [
                { translateX: shakeAnim },
                {
                  translateX: stepTransition.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [-300, 0],
                  }),
                },
              ],
              opacity: stepTransition.interpolate({
                inputRange: [-1, 0],
                outputRange: [0, 1],
              }),
            },
          ]}>
            {/* Error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {step === 1 ? (
              <>
                {/* Avatar Picker */}
                <Text style={styles.sectionLabel}>Выбери аватар</Text>
                <View style={styles.avatarGrid}>
                  {AVATARS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar}
                      style={[
                        styles.avatarOption,
                        selectedAvatar === avatar && styles.avatarOptionSelected,
                      ]}
                      onPress={() => setSelectedAvatar(avatar)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.avatarEmoji}>{avatar}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Name input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Как тебя зовут?</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={(text) => { setName(text); setError(''); }}
                      placeholder="Введи своё имя"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="words"
                      maxLength={30}
                    />
                  </View>
                </View>

                {/* Next button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !name.trim() && styles.buttonDisabled,
                  ]}
                  onPress={handleNextStep}
                  disabled={!name.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>ДАЛЕЕ</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Selected avatar preview */}
                <View style={styles.selectedAvatarPreview}>
                  <View style={styles.selectedAvatarCircle}>
                    <Text style={styles.selectedAvatarEmoji}>{selectedAvatar}</Text>
                  </View>
                  <Text style={styles.selectedAvatarName}>{name}</Text>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(text) => { setEmail(text); setError(''); }}
                      placeholder="example@mail.ru"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Пароль</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={password}
                      onChangeText={(text) => { setPassword(text); setError(''); }}
                      placeholder="Минимум 4 символа"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Повторите пароль</Text>
                  <View style={[
                    styles.inputWrapper,
                    confirmPassword && password !== confirmPassword && styles.inputWrapperError,
                    confirmPassword && password === confirmPassword && styles.inputWrapperSuccess,
                  ]}>
                    <Text style={styles.inputIcon}>🔐</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                      placeholder="Повторите пароль"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !isStep2Valid && styles.buttonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={loading || !isStep2Valid}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backStepButton}
                  onPress={() => animateStepTransition(1)}
                >
                  <Text style={styles.backStepText}>← Назад</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          {/* Login link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Уже есть аккаунт?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLinkButton}> Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  bgCircle1: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  headerEmoji: {
    fontSize: 44,
    marginBottom: SIZES.sm,
  },
  headerTitle: {
    fontSize: 32,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.fontBase,
    color: 'rgba(255,255,255,0.8)',
    ...FONTS.regular,
    marginTop: 4,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  stepDotActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  stepLine: {
    width: 50,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: COLORS.white,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    ...SHADOWS.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: SIZES.sm,
  },
  errorText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.errorDark,
    ...FONTS.medium,
  },
  sectionLabel: {
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SIZES.lg,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLightest,
    borderWidth: 3,
    ...SHADOWS.sm,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  selectedAvatarPreview: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  selectedAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLightest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  selectedAvatarEmoji: {
    fontSize: 36,
  },
  selectedAvatarName: {
    fontSize: SIZES.fontLg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.sm,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  inputWrapperSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    ...FONTS.regular,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SIZES.sm,
    ...SHADOWS.button,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  backStepButton: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  backStepText: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  loginLinkText: {
    fontSize: SIZES.fontBase,
    color: 'rgba(255,255,255,0.7)',
    ...FONTS.regular,
  },
  loginLinkButton: {
    fontSize: SIZES.fontBase,
    color: COLORS.white,
    ...FONTS.bold,
  },
});
