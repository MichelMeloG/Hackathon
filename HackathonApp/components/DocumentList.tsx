import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';

interface DocumentListProps {
  username: string;
}

export default function DocumentList({ username }: DocumentListProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`https://n8n.bernardolobo.com.br/webhook-test/historico-documentos?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar documentos');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Não foi possível carregar os documentos. Por favor, tente novamente.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [username]);

  const handleDocumentSelect = (documentName: string) => {
    router.push({
      pathname: '/document-viewer',
      params: { documentName }
    });
  };

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Seus Documentos</ThemedText>
      <ScrollView style={styles.list}>
        {documents.map((doc, index) => (
          <TouchableOpacity
            key={index}
            style={styles.documentItem}
            onPress={() => handleDocumentSelect(doc)}
          >
            <ThemedText style={styles.documentName}>{doc}</ThemedText>
          </TouchableOpacity>
        ))}
        {documents.length === 0 && !error && (
          <ThemedText style={styles.emptyMessage}>
            Nenhum documento encontrado
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  documentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  documentName: {
    fontSize: 16,
    color: '#ffffff',
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    marginTop: 20,
  },
});
