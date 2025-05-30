import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { hex_sha256 } from '../utils/sha256';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {      if (!email || !username || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validação do username
      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('Username can only contain letters, numbers and underscores');
        return;
      }const hashedPassword = hex_sha256(password);
      const hashedEmail = hex_sha256(email);
      const hashedUsername = hex_sha256(username);

      // Store original username for login purposes
      const originalData = {
        email,
        username,
        hashedEmail,
        hashedUsername,
      };
      
      console.log('Sending registration data:', {
        email: hashedEmail.substring(0, 10) + '...',
        username: hashedUsername.substring(0, 10) + '...',
        password: hashedPassword.substring(0, 10) + '...' // Log partial hash for debugging
      });      const response = await fetch('https://n8n.bernardolobo.com.br/webhook/19473c7c-99bf-40b4-b2e0-d4c548970872', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: hashedEmail,
          username: hashedUsername,
          password: hashedPassword,
          originalUsername: username, // Username é nossa chave primária
          originalEmail: email // Email para contato
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Registration response:', data);
          
          // Se a resposta foi 200 OK, consideramos como sucesso mesmo sem data.success
          router.replace('/login');
        } catch (err) {
          // Se não conseguir fazer parse do JSON mas o status for ok, ainda consideramos sucesso
          if (response.ok) {
            router.replace('/login');
          } else {
            console.error('Failed to parse response:', err);
            setError('Registration failed: Invalid server response');
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Registration failed:', response.status, errorText);
        setError(`Registration failed: ${response.status} ${errorText || 'Unknown error'}`);
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    }
  };

  const goToLogin = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Create Account</ThemedText>
        <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />
        <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />
      
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <ThemedText style={styles.buttonText}>Register</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={goToLogin}>
        <ThemedText style={styles.linkText}>Already have an account? Login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#151718', // Fundo escuro consistente
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
    padding: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
});
