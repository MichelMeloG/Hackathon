import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface NavBarProps {
  showAuthButtons?: boolean;
}

export default function NavBar({ showAuthButtons = false }: NavBarProps) {
  const { logout } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={() => router.push('/')}
      >
        <Image 
          source={require('../assets/images/favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>AI Legal Assistant</ThemedText>
      </TouchableOpacity>
        {showAuthButtons ? (
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/register')}
          >
            <ThemedText style={styles.buttonText}>Register</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#151718',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  registerButton: {
    backgroundColor: '#0a7ea4',
  },
  logoutButton: {
    backgroundColor: '#0a7ea4',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
