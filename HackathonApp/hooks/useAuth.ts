import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);
      setIsAuthenticated(!!storedUsername);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string) => {
    try {
      await AsyncStorage.setItem('username', username);
      setUsername(username);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      setUsername(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw error;
    }
  };
  return {
    isAuthenticated,
    loading,
    username,
    login,
    logout,
  };
}
