import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '../components/NavBar';

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavBar showAuthButtons={!isAuthenticated} />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="login" options={{ animation: 'none' }} />
              <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="document-viewer" />
            </>
          )}
        </Stack>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
  content: {
    flex: 1,
    marginTop: 60, // Altura da NavBar
  },
});
