import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
  USERS: '@owlmath_users',
  CURRENT_USER: '@owlmath_current_user',
};

/**
 * Get all registered users
 */
export async function getUsers() {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEYS.USERS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading users:', error);
    return {};
  }
}

/**
 * Register a new user
 * @returns {{ success: boolean, error?: string }}
 */
export async function registerUser(name, email, password) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: 'Все поля обязательны для заполнения' };
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'Имя должно быть не менее 2 символов' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Введите корректный email' };
    }

    if (password.length < 4) {
      return { success: false, error: 'Пароль должен быть не менее 4 символов' };
    }

    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }

    users[normalizedEmail] = {
      name: name.trim(),
      email: normalizedEmail,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
      avatar: '🦉',
    };

    await AsyncStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));

    // Auto-login after registration
    await setCurrentUser(normalizedEmail, users[normalizedEmail]);

    return { success: true, user: users[normalizedEmail] };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: 'Произошла ошибка при регистрации' };
  }
}

/**
 * Login an existing user
 * @returns {{ success: boolean, error?: string }}
 */
export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Введите email и пароль' };
    }

    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const user = users[normalizedEmail];

    if (!user) {
      return { success: false, error: 'Пользователь не найден' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Неверный пароль' };
    }

    await setCurrentUser(normalizedEmail, user);

    return { success: true, user };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'Произошла ошибка при входе' };
  }
}

/**
 * Set current logged-in user
 */
async function setCurrentUser(email, user) {
  await AsyncStorage.setItem(
    AUTH_KEYS.CURRENT_USER,
    JSON.stringify({ email, ...user })
  );
}

/**
 * Get current logged-in user (null if not logged in)
 */
export async function getCurrentUser() {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logoutUser() {
  try {
    await AsyncStorage.removeItem(AUTH_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}
