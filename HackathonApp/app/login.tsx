import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { hex_sha256 } from '../utils/sha256';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      // Validação dos campos
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }

      // Limpa erro anterior
      setError('');
      
      // Gera os hashes para comparação
      const hashedPassword = hex_sha256(password);
      const hashedUsername = hex_sha256(username);
      
      console.log('Attempting login for user:', username);
      console.log('Hashed username:', hashedUsername);
      console.log('Hashed password:', hashedPassword);
        const response = await fetch('https://n8n.bernardolobo.com.br/webhook/login', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: hashedUsername,   // Username hasheado para comparação
          password: hashedPassword          // Senha hasheada para comparação
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        const data = await response.json();
      
      if (data.confirmation === "True") {
        console.log('Login successful');
        
        // Armazena o username do usuário autenticado
        await login(username);
        
        // Redireciona para a área principal do app
        router.replace('/(tabs)');
      } else {
        // Mostra mensagem de erro
        setError('Username or password incorrect');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Login</ThemedText>
        <TextInput
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
      />
      
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Login</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={() => router.push('/register')}
      >
        <ThemedText style={styles.linkText}>Don't have an account? Register</ThemedText>
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
    width: '100%',    maxWidth: 400,
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
