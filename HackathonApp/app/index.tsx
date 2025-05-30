import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

export default function HomeScreen() {  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Assistente Jurídico IA</ThemedText>
      <ThemedText style={styles.subtitle}>
        Simplifique a compreensão de documentos jurídicos
      </ThemedText>
      
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            router.push('/document-viewer');
          }}>
          <ThemedText style={styles.buttonText}>Novo Documento</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // TODO: Implementar navegação para histórico
            console.log('Histórico');
          }}>
          <ThemedText style={styles.buttonText}>Histórico</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#151718', // Fundo escuro
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
    maxWidth: 400,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#ffffff',
    maxWidth: 400,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
