import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login, logout, getCurrentUser, type UserInfo } from '../api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const userInfo = ref<UserInfo | null>(null);

  const initUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser);
      } catch {
        userInfo.value = null;
      }
    }
  };

  const handleLogin = async (username: string, password: string) => {
    const result = await login({ username, password });
    token.value = result.token;
    userInfo.value = result.user;
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      token.value = '';
      userInfo.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const fetchUserInfo = async () => {
    const user = await getCurrentUser();
    userInfo.value = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  };

  return {
    token,
    userInfo,
    initUser,
    handleLogin,
    handleLogout,
    fetchUserInfo,
  };
});
