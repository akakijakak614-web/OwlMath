import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { loadProgress, saveProgress } from './src/utils/storage';
import { getCurrentUser, logoutUser } from './src/utils/auth';
import { COLORS, FONTS, SIZES } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function TabIcon({ icon, label, focused }) {
  return (
    <View style={tabStyles.container}>
      <Text style={[
        tabStyles.icon,
        focused && tabStyles.iconFocused,
      ]}>
        {icon}
      </Text>
      <Text style={[
        tabStyles.label,
        focused && tabStyles.labelFocused,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  iconFocused: {
    fontSize: 26,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    ...FONTS.medium,
  },
  labelFocused: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
});

function HomeStackScreen({ progress, setProgress }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {(props) => (
          <HomeScreen
            {...props}
            route={{ ...props.route, params: { progress, setProgress } }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Quiz"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      >
        {(props) => (
          <QuizScreen
            {...props}
            route={{
              ...props.route,
              params: {
                ...props.route.params,
                progress,
                setProgress,
              },
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs({ progress, setProgress, user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          elevation: 10,
          shadowColor: COLORS.primaryDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Обучение"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📚" label="Обучение" focused={focused} />
          ),
        }}
      >
        {() => <HomeStackScreen progress={progress} setProgress={setProgress} />}
      </Tab.Screen>

      <Tab.Screen
        name="Рейтинг"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" label="Рейтинг" focused={focused} />
          ),
        }}
      >
        {(props) => (
          <LeaderboardScreen
            {...props}
            route={{ ...props.route, params: { progress } }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Профиль"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🦉" label="Профиль" focused={focused} />
          ),
        }}
      >
        {(props) => (
          <ProfileScreen
            {...props}
            route={{
              ...props.route,
              params: { progress, setProgress, user, onLogout },
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthNavigator({ onAuthSuccess }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onLoginSuccess={onAuthSuccess}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="Register"
        options={{ animation: 'slide_from_right' }}
      >
        {(props) => (
          <RegisterScreen
            {...props}
            onRegisterSuccess={onAuthSuccess}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const [savedProgress, savedUser] = await Promise.all([
        loadProgress(),
        getCurrentUser(),
      ]);
      setProgress(savedProgress);
      setUser(savedUser);
      setLoading(false);
    }
    init();
  }, []);

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    // Load progress (or keep default if new user)
    const savedProgress = await loadProgress();
    setProgress(savedProgress);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🦉</Text>
        <Text style={styles.loadingTitle}>OwlMath</Text>
        <ActivityIndicator size="large" color={COLORS.white} style={{ marginTop: 20 }} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      {user ? (
        <MainTabs
          progress={progress}
          setProgress={setProgress}
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <AuthNavigator onAuthSuccess={handleAuthSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingEmoji: {
    fontSize: 80,
  },
  loadingTitle: {
    fontSize: 36,
    color: COLORS.white,
    ...FONTS.bold,
    marginTop: 16,
  },
});
