import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

export default function HomeScreen() {  
  const { username } = useAuth();
  
  if (!username) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Erro</ThemedText>
        <ThemedText style={styles.subtitle}>
          Você precisa estar logado para acessar esta página.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Assistente Jurídico IA</ThemedText>
      <ThemedText style={styles.subtitle}>
        Simplifique a compreensão de documentos jurídicos
      </ThemedText>
      
      <View style={styles.content}>
        <DocumentUpload username={username} onSuccess={() => {}} />
        <DocumentList username={username} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#151718',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
